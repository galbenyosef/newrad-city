/* src/quests_extra/00_core.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 00: CORE TOOLKIT
 * Owned by: quests_extra (order 62).   Private namespace: G.qx
 *
 * Extra quest content on the ORIGINAL landmarks and the streets of
 * Manhattan (the POI directories have their own quests):
 *   10_guide.js    "The Big Apple Survival Guide" — Dot Finch's 5-chapter
 *                  questline (Grand Central Market)
 *   20_misc.js     six street / misc quests + their NPCs
 *   30_radio.js    three radio-signal quests (Cryo Unit C-4 distress beacon,
 *                  the U.N. numbers station, Bear Market Betty's ransom)
 *   35_cryo_c4.js  the flooded Cryo Unit C-4 interior (own cell, default
 *                  x 12600 z 2800, auto-moved clear of every LAYOUT.INTERIORS cell;
 *                  root.visible = player inside the cell, never drawn from outside)
 *   40_street.js   street encounters (fortune teller, three-card monte)
 *   90_test.js     scripted self-test (?qxtest)
 *
 * The quest ENGINE is the quests module's (G.quests.define/start/...):
 * quest state, markers, the goggles quest log and banners all live there and
 * are saved with it. This module keeps only its own flags (save key
 * 'quests_extra'), NPCs (stable ids, restored by combat) and world props.
 * Every call into another module is made at call time and guarded.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  let FLAGS = {};
  const HOOKS = {
    items: [],
    quests: [],
    register: [],
    world: [],
    spawn: [],
    update: [],
    always: [],
    reset: [],
    loaded: [],
  };
  const DIALOGUES = new Map();
  const TERMINALS = new Map();
  const TRIGGERS = [];
  const LATER = [];
  const SESSION = []; // session-scoped handles (interactables / pickups) removed on reset
  let worldBuilt = false;
  let gen = 0;

  function safe(where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("quests_extra:" + where, e);
      return undefined;
    }
  }
  const live = (ns) => !!G[ns] && !G.isStub(ns);
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  // Shared ids still owned by other modules (rpg / sound).
  const SCRIP = "scrip";
  const MONEY = "scrip",
    ADD_MONEY = "addScrip",
    PICKUP_MONEY_SFX = "pickup_scrip";

  const QX = {
    V3,
    safe,
    live,
    npcs: {},
    pickups: {},
    world: {},
    /** stable npc ids spawned by this module (for the self-test + debug) */
    roster: [],

    // ---- phases ----
    hook(phase, fn) {
      (HOOKS[phase] = HOOKS[phase] || []).push(fn);
    },
    run(phase, arg) {
      for (const fn of HOOKS[phase] || []) safe("hook:" + phase, () => fn(arg));
    },

    // ---- flags (own save block) ----
    flag(k) {
      return FLAGS[k];
    },
    setFlag(k, v) {
      FLAGS[k] = v === undefined ? true : v;
      return FLAGS[k];
    },
    inc(k, n) {
      FLAGS[k] = (Number(FLAGS[k]) || 0) + (n === undefined ? 1 : n);
      return FLAGS[k];
    },
    once(k) {
      if (FLAGS["once_" + k]) return false;
      FLAGS["once_" + k] = true;
      return true;
    },
    allFlags() {
      return JSON.parse(JSON.stringify(FLAGS));
    },

    // ---- quest engine passthrough (quests module) ----
    qlive() {
      return live("quests") && typeof G.quests.define === "function";
    },
    define(def) {
      QX.defs[def.id] = def;
      if (!QX.qlive()) return null;
      def.giver = def.giver || "";
      return safe("define:" + def.id, () => G.quests.define(def));
    },
    /** every quest this module defines (id → def), for the self-test's collision check */
    defs: {},
    start(id, opts) {
      if (!QX.qlive()) return false;
      return !!safe("start:" + id, () => G.quests.start(id, opts));
    },
    setStage(id, s) {
      if (!QX.qlive()) return false;
      return !!safe("stage:" + id, () => G.quests.setStage(id, s));
    },
    complete(id) {
      if (!QX.qlive()) return false;
      return !!safe("complete:" + id, () => G.quests.complete(id));
    },
    fail(id) {
      if (!QX.qlive()) return false;
      return !!safe("fail:" + id, () => G.quests.fail(id));
    },
    stage(id) {
      return QX.qlive() ? G.quests.stage(id) : null;
    },
    active(id) {
      return QX.qlive() && !!G.quests.isActive(id);
    },
    done(id) {
      return QX.qlive() && !!G.quests.isComplete(id);
    },
    failed(id) {
      return QX.qlive() && !!(G.quests.isFailed && G.quests.isFailed(id));
    },
    started(id) {
      return (
        QX.qlive() &&
        !!(G.quests.isStarted
          ? G.quests.isStarted(id)
          : G.quests.isActive(id) || G.quests.isComplete(id))
      );
    },
    reached(id, s) {
      return QX.qlive() && !!(G.quests.reached && G.quests.reached(id, s));
    },
    /** Counter refresh without a jingle (quests' own convention: event 'questCounter'). */
    refresh(id) {
      if (!QX.qlive()) return;
      const v = G.quests.get ? G.quests.get(id) : null;
      if (!v || !v.active) return;
      G.events.emit("questCounter", v);
      if (v.stageText) QX.notify(v.stageText, { sub: v.name, quiet: true });
    },
    /** A flag of the quests module (read only, e.g. 'betty_dead'). */
    qflag(k) {
      return QX.qlive() && G.quests.flag ? G.quests.flag(k) : undefined;
    },
    /** Set a flag in the quests module's store (main-story hooks other modules read). Main-story outcome flags are
     *  written twice: the outline name (`skyeye_jammed`) and the main story's `ms_` name (`ms_skyeye_jammed`). */
    setQflag(k, v) {
      if (QX.qlive() && G.quests.setFlag)
        safe("qflag:" + k, () =>
          G.quests.setFlag(k, v === undefined ? true : v),
        );
    },
    msFlag(k, v) {
      QX.setQflag(k, v);
      QX.setQflag("ms_" + k, v);
    },

    // ---- main story (outline v2): side quests of this module absorbed into the main line ----
    /** id → { mq: the main quest that runs it as a proxy stage (src/quests/61_ms_core.js ms.proxy), after: fallback gate }.
     *  The side quest keeps its id, stages and flags; the main quest hides it from the log while it runs, and counts a
     *  side quest finished before the main quest unlocked as done. */
    MAIN: {
      qx_numbers: { mq: "mq20", after: ["mq04"] },
    },
    /** May this absorbed quest start yet? Only once its main quest has started (or, without that quest, after its gate). */
    mainOpen(id) {
      const m = QX.MAIN[id];
      if (!m || !QX.qlive()) return true;
      if (G.quests.get && G.quests.get(m.mq)) return QX.started(m.mq);
      return (m.after || []).every((q) => QX.done(q));
    },
    /** Rose ("Flint"): the actor built from the `rose` character preset, if she is within r metres of the player. */
    roseNear(r) {
      if (!live("actors") || !G.actors.list) return null;
      const P = G.player && G.player.pos;
      if (!P) return null;
      for (const a of safe("actors", () => G.actors.list()) || []) {
        if (!a || a.dead || !a.pos) continue;
        if (
          a.type !== "rose" &&
          a.preset !== "rose" &&
          !/^(ms_|q_|mq_)?rose$/.test(String(a.id || ""))
        )
          continue;
        if (Math.hypot(a.pos.x - P.x, a.pos.z - P.z) <= (r || 15)) return a;
      }
      return null;
    },

    // ---- dialogue / terminals (ui_interact, order 70 → registered at initDone) ----
    dialogue(id, tree) {
      DIALOGUES.set(id, tree);
      if (live("dialogue") && G.dialogue.register)
        safe("dlg:" + id, () => G.dialogue.register(id, tree));
      return id;
    },
    terminal(id, def) {
      TERMINALS.set(id, def);
      if (live("terminals") && G.terminals.register)
        safe("term:" + id, () => G.terminals.register(id, def));
      return id;
    },
    registerAll() {
      if (live("dialogue") && G.dialogue.register)
        for (const [id, t] of DIALOGUES)
          safe("dlg:" + id, () => G.dialogue.register(id, t));
      if (live("terminals") && G.terminals.register)
        for (const [id, t] of TERMINALS)
          safe("term:" + id, () => G.terminals.register(id, t));
    },
    DIALOGUES,
    TERMINALS,
    talk(dlgId, npcId) {
      if (!live("dialogue") || !G.dialogue.start) return false;
      const a = npcId ? QX.npc(npcId) : null;
      safe("talk", () => G.dialogue.start(dlgId, a));
      return true;
    },

    // ---- feedback ----
    notify(text, opts) {
      safe("notify", () => G.notify(text, opts));
    },
    sfx(name, opts) {
      if (live("sfx")) safe("sfx", () => G.sfx.play(name, opts));
    },
    news(text) {
      if (live("radio") && G.radio.addNews)
        safe("news", () => G.radio.addNews(text));
    },
    /** The hero's name (never hard-coded). */
    pname() {
      return (G.HERO && G.HERO.name) || "stranger";
    },
    gameName() {
      return G.GAME_NAME || "New Rad City";
    },

    // ---- items / inventory ----
    itemExists(id) {
      return live("items") && !!G.items.get && !!G.items.get(id);
    },
    defineItem(def) {
      if (!live("items") || !G.items.define) return null;
      return safe("item:" + def.id, () => G.items.define(def));
    },
    count(id) {
      if (!live("inventory") || !id) return 0;
      return safe("count", () => G.inventory.count(id)) || 0;
    },
    has(id, n) {
      return QX.count(id) >= (n || 1);
    },
    give(id, n, silent) {
      if (!id || !live("inventory")) return false;
      if (id === SCRIP) return QX.giveScrip(n);
      if (live("items") && G.items.get && !G.items.get(id)) return false;
      safe("give:" + id, () =>
        G.inventory.add(id, n || 1, silent ? { silent: true } : undefined),
      );
      return true;
    },
    take(id, n) {
      if (!id || !live("inventory") || !QX.has(id, n || 1)) return false;
      safe("take:" + id, () => G.inventory.remove(id, n || 1));
      return true;
    },
    /** Federal ration Scrip the player carries (the currency item id is shared: SCRIP). */
    scrip() {
      if (!live("inventory")) return 0;
      return (
        safe("scrip", () =>
          G.inventory.scrip
            ? G.inventory.scrip()
            : G.inventory[MONEY]
              ? G.inventory[MONEY]()
              : G.inventory.count(SCRIP),
        ) || 0
      );
    },
    giveScrip(n) {
      if (!live("inventory") || !n) return false;
      safe("scrip", () => {
        const add = G.inventory.addScrip || G.inventory[ADD_MONEY];
        if (add) add.call(G.inventory, n);
        else if (n > 0) G.inventory.add(SCRIP, n);
        else G.inventory.remove(SCRIP, -n);
      });
      if (n < 0) QX.notify(-n + " Scrip handed over.");
      else QX.sfx(PICKUP_MONEY_SFX);
      return true;
    },
    pay(n) {
      if (QX.scrip() < n) {
        QX.notify("You don't have enough Scrip.");
        QX.sfx("ui_error");
        return false;
      }
      QX.giveScrip(-n);
      QX.sfx("barter_trade");
      return true;
    },
    /** Shared id of the Scrip currency item (for merchant stock / NPC inventories). */
    SCRIP_ID: SCRIP,

    // ---- rpg ----
    xp(n, reason) {
      if (live("rpg") && G.rpg.addXP) safe("xp", () => G.rpg.addXP(n, reason));
      else QX.notify("+" + n + " XP");
    },
    /** Standing (Trusted … Feared): + for decent acts, - for cruel ones. */
    standing(n, reason) {
      const R = live("rpg") ? G.rpg : null;
      const add = R && R.addStanding;
      if (add) safe("standing", () => add.call(R, n, reason));
      QX.inc("standing_acc", n);
    },
    /** 0 Trusted · 1 Decent · 2 Neutral · 3 Shady · 4 Feared */
    standingTier() {
      const R = live("rpg") ? G.rpg : null;
      const fn = R && R.standingTier;
      if (typeof fn === "function") {
        const t = safe("standingTier", () => fn.call(R));
        if (typeof t === "number") return t;
      }
      const k = Number(FLAGS.standing_acc) || 0;
      return k >= 750 ? 0 : k >= 250 ? 1 : k > -250 ? 2 : k > -750 ? 3 : 4;
    },
    skill(id) {
      if (!live("rpg") || !G.rpg.skill) return 25;
      return safe("skill", () => G.rpg.skill(id)) || 0;
    },
    /** Attribute 1-10 by its name: brawn, reflex, grit, wits, senses, presence. */
    attr(name) {
      if (!live("rpg") || typeof G.rpg.attr !== "function") return 5;
      const v = safe("attr", () => G.rpg.attr(name));
      return typeof v === "number" ? v : 5;
    },
    /** Attribute modifiers for an effect / apparel def from attribute names ({senses: 1}). */
    attrMods(o) {
      return { attrs: Object.assign({}, o) };
    },
    hasTalent(id) {
      return live("rpg") && typeof G.rpg.hasTalent === "function"
        ? !!safe("talent", () => G.rpg.hasTalent(id))
        : false;
    },
    addEffect(def) {
      if (live("rpg") && G.rpg.addEffect)
        return safe("effect", () => G.rpg.addEffect(def));
      return null;
    },
    /** Accumulated radiation dose. */
    radLevel() {
      return (G.player && (G.player.rads || 0)) || 0;
    },

    // ---- locks: keys / codes / passcodes (G.locks, REBRAND §5). While the locks module is absent a lock simply opens. ----
    locksLive() {
      return live("locks") && typeof G.locks.open === "function";
    },
    /** Declare a lock (call from the world / spawn phases, not at script top level). */
    registerLock(spec) {
      if (live("locks") && G.locks.register)
        return safe("locks.register:" + spec.id, () => G.locks.register(spec));
      return null;
    },
    /** Player interaction with a custom lock: key → opens, code → keypad, passcode → teletype prompt. */
    openLock(spec, onOpen, opts) {
      try {
        if (QX.locksLive()) {
          if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
            onOpen();
            return;
          }
          G.locks.open(spec, onOpen, opts);
          return;
        }
      } catch (e) {
        G.reportError("quests_extra:locks:" + spec.id, e);
      }
      onOpen();
    },
    isUnlocked(id) {
      return QX.locksLive() && G.locks.isOpen
        ? !!safe("locks.isOpen", () => G.locks.isOpen(id))
        : false;
    },
    unlock(id) {
      if (live("locks") && G.locks.unlock)
        safe("locks.unlock", () => G.locks.unlock(id));
    },
    /** The player read / heard a code: log it in Goggles → NOTES → CODES. */
    learnCode(id, src) {
      if (live("locks") && G.locks.learn)
        safe("locks.learn:" + id, () => G.locks.learn(id, src));
    },
    /** Audit: declare where a code can be learned / a key can be had (scripted gifts, dialogue, rewards). */
    codeFrom(id, label) {
      if (live("locks") && G.locks.learnableFrom)
        safe("locks.learnableFrom", () => G.locks.learnableFrom(id, label));
    },
    keyFrom(itemId, label) {
      if (live("locks") && G.locks.obtainableFrom)
        safe("locks.obtainableFrom", () =>
          G.locks.obtainableFrom(itemId, label),
        );
    },

    // ---- world queries ----
    dist(x, z) {
      const p = G.player.pos;
      return Math.hypot(p.x - x, p.z - z);
    },
    inInterior() {
      return !!G.player && G.player.pos.x >= IXM();
    },

    /**
     * Anchor lookup: G.landmarks → G.pois → G.map (interiors), then the fallback resolved
     * to a free grounded spot. Memoised once the world is built (anchors are static).
     */
    anchorCache: new Map(),
    anchor(site, names, fallback, opts) {
      names = [].concat(names || []);
      const key =
        site +
        "|" +
        names.join(",") +
        "|" +
        (fallback
          ? fallback.x +
            "," +
            fallback.z +
            "," +
            (fallback.y === undefined ? "" : fallback.y)
          : "-");
      if (worldBuilt && QX.anchorCache.has(key)) {
        const c = QX.anchorCache.get(key);
        return c ? Object.assign({}, c) : null;
      }
      let out = null;
      for (const n of names) {
        let a = null;
        if (
          !a &&
          live("landmarks") &&
          typeof G.landmarks.getAnchor === "function"
        )
          a = safe("lm.anchor", () => G.landmarks.getAnchor(site, n));
        if (!a && live("pois") && typeof G.pois.getAnchor === "function")
          a = safe("poi.anchor", () => G.pois.getAnchor(site, n));
        if (!a && live("map") && typeof G.map.getAnchor === "function")
          a = safe("map.anchor", () => G.map.getAnchor(site, n));
        if (a && isFinite(a.x) && isFinite(a.z)) {
          out = { x: a.x, y: a.y || 0, z: a.z, anchored: true, name: n };
          break;
        }
      }
      if (!out && fallback)
        out = QX.freeSpot(fallback.x, fallback.z, fallback.y, opts);
      if (worldBuilt)
        QX.anchorCache.set(key, out ? Object.assign({}, out) : null);
      return out;
    },
    /** Is a cylinder at (x,y,z) blocked by a collider taller than stepTol? */
    blocked(x, y, z, r, stepTol) {
      const W = G.world;
      r = r || 0.4;
      const tol = stepTol === undefined ? 0.45 : stepTol;
      if (!W.query) return false;
      const cs = W.query(x - r - 0.5, z - r - 0.5, x + r + 0.5, z + r + 0.5);
      for (const c of cs) {
        if (c.maxY <= y + tol || c.minY >= y + 1.7) continue;
        if (W.pointInCollider ? W.pointInCollider(c, x, z, r) : true)
          return true;
      }
      return false;
    },
    /** Free, grounded spot near (x,z): strict pass (floor level, kerb-free), then lenient. */
    freeSpot(x, z, y, opts) {
      opts = opts || {};
      const W = G.world;
      const hasY = y !== undefined && y !== null;
      const maxR = opts.maxR || 12;
      const mk = (strict) => (px, pz) => {
        if (px < IXM() && G.LAYOUT && !G.LAYOUT.isLand(px, pz)) return null;
        const base = hasY ? y : px >= IXM() ? 0 : W.terrainHeight(px, pz);
        const gy = W.groundHeight(px, pz, base + 0.6, 0.3);
        if (Math.abs(gy - base) > (strict ? 0.35 : 1.6)) return null;
        if (gy < W.waterLevel - 0.2 && px < IXM()) return null;
        if (QX.blocked(px, gy, pz, opts.radius || 0.45, strict ? 0.15 : 0.45))
          return null;
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
      const b0 = hasY ? y : x >= IXM() ? 0 : W.terrainHeight(x, z);
      return { x, y: W.groundHeight(x, z, b0 + 0.6, 0.3), z, forced: true };
    },
    /** Yaw that looks from (x,z) toward (tx,tz) (yaw 0 = north/-Z). */
    yawTo(x, z, tx, tz) {
      return Math.atan2(-(tx - x), -(tz - z));
    },

    // ---- actors ----
    npc(id) {
      const a = QX.npcs[id];
      if (a && !a._removed && !a.removed) return a;
      if (live("actors") && G.actors.get) {
        const b = safe("actors.get", () => G.actors.get(id));
        if (b) {
          QX.npcs[id] = b;
          return b;
        }
      }
      return null;
    },
    alive(id) {
      const a = QX.npc(id);
      return !!a && !a.dead;
    },
    /**
     * Spawn a named NPC (idempotent per stable id; combat restores saved hp/pos/death).
     * def = G.actors.spawn def + {at:{site?, anchors?, fallback:{x,z,y?}}, lookAt?:{x,z}}.
     */
    spawnNPC(def) {
      if (!live("actors") || !G.actors.spawn) return null;
      const existing = safe(
        "actors.get",
        () => G.actors.get && G.actors.get(def.id),
      );
      if (existing && !existing.removed && !existing._removed) {
        QX.npcs[def.id] = existing;
        return existing;
      }
      let pos = def.pos;
      if (def.at)
        pos = def.at.site
          ? QX.anchor(def.at.site, def.at.anchors, def.at.fallback)
          : QX.freeSpot(
              def.at.fallback.x,
              def.at.fallback.z,
              def.at.fallback.y,
              { maxR: def.at.maxR },
            );
      if (!pos) return null;
      const sd = Object.assign({}, def);
      delete sd.at;
      delete sd.lookAt;
      sd.pos = { x: pos.x, y: pos.y || 0, z: pos.z };
      if (sd.home === "here")
        sd.home = { x: pos.x, z: pos.z, r: def.homeR || 3 };
      if (def.lookAt && sd.yaw === undefined)
        sd.yaw = QX.yawTo(pos.x, pos.z, def.lookAt.x, def.lookAt.z);
      if (sd.merchant && sd.merchant.stock)
        sd.merchant = Object.assign({}, sd.merchant, {
          stock: sd.merchant.stock.filter((s) => QX.itemExists(s[0])),
        });
      if (sd.inventory)
        sd.inventory = sd.inventory.filter(
          (s) => s[0] === SCRIP || QX.itemExists(s[0]),
        );
      if (sd.weapon && !QX.itemExists(sd.weapon)) delete sd.weapon;
      const a = safe("spawn:" + def.id, () => G.actors.spawn(sd));
      if (a) {
        QX.npcs[def.id] = a;
        a.questNpc = true;
        a.qxNpc = true;
        if (FLAGS["dead_" + def.id] && !a.dead && a.kill)
          safe("restoreDead", () => a.kill({ silent: true, restore: true }));
        if (sd.yaw !== undefined) a.yaw = sd.yaw;
        if (QX.roster.indexOf(def.id) < 0) QX.roster.push(def.id);
      }
      return a;
    },
    removeNPC(id) {
      const a = QX.npc(id);
      if (!a) return;
      if (live("actors") && G.actors.remove)
        safe("remove", () => G.actors.remove(a));
      a._removed = true;
      delete QX.npcs[id];
    },
    say(id, text, dur) {
      const a = QX.npc(id);
      if (a && a.say && !a.dead) safe("say", () => a.say(text, dur));
    },
    moveNPC(id, p) {
      const a = QX.npc(id);
      if (!a || a.dead || !p) return;
      a.pos.set(p.x, p.y || 0, p.z);
      if (a.home) {
        a.home.x = p.x;
        a.home.z = p.z;
      }
    },

    // ---- world objects ----
    prop(type, opts) {
      if (!live("props") || !G.props.spawn) return null;
      return safe("props." + type, () => G.props.spawn(type, opts));
    },
    /** Static interactable (world, never removed). def per G.world.addInteractable. */
    interact(def) {
      return G.world.addInteractable(def);
    },
    /** Session interactable (removed on reset). */
    sessionInteract(def) {
      const it = G.world.addInteractable(def);
      SESSION.push({ interactable: it });
      return it;
    },
    /**
     * Place a quest pickup once per game (key → flag 'got_<key>' once taken). Session scoped.
     * Collected detection: the rpg itemAdded event while standing next to it.
     */
    pickup(key, itemId, n, pos) {
      if (
        FLAGS["got_" + key] ||
        !QX.itemExists(itemId) ||
        !live("items") ||
        !G.items.spawnPickup
      )
        return null;
      const h = safe("pickup:" + key, () =>
        G.items.spawnPickup(itemId, n || 1, V3(pos.x, pos.y || 0, pos.z), {
          static: false,
          noSave: true,
          keepY: pos.y !== undefined,
        }),
      );
      if (h) {
        QX.pickups[key] = { id: itemId, pos, handle: h };
        SESSION.push({ pickup: h });
      }
      return h;
    },
    terminalProp(terminalId, pos, yaw, mount) {
      return QX.prop("terminal", {
        x: pos.x,
        y: pos.y || 0,
        z: pos.z,
        yaw: yaw || 0,
        terminalId,
        mount: mount || undefined,
        persistent: true,
      });
    },

    // ---- triggers (5 Hz) ----
    /** {id, x,z,r | pos():{x,z}, y?, dy?, cond?(), fire(), once=true, cooldown?} ; once-triggers persist via flags. */
    trigger(def) {
      if (def.once === undefined) def.once = true;
      TRIGGERS.push(def);
      return def;
    },

    // ---- scheduling (game time; cancelled on reset) ----
    later(sec, fn) {
      LATER.push({ t: Math.max(0, sec || 0), fn, gen });
    },

    // ---- DOM ----
    el(tag, cls, parent) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      (parent || document.body).appendChild(e);
      return e;
    },
  };
  G.qx = QX;

  // ------------------------------------------------------------------
  // Trigger polling
  // ------------------------------------------------------------------
  let trigT = 0;
  function pollTriggers(dt) {
    trigT -= dt;
    if (trigT > 0) return;
    trigT = 0.2;
    const p = G.player.pos;
    for (const t of TRIGGERS) {
      if (t.once && FLAGS["trig_" + t.id]) continue;
      if (t._cool && G.time.real < t._cool) continue;
      let x = t.x,
        z = t.z;
      if (t.pos) {
        const pp = safe("trigpos", t.pos);
        if (!pp) continue;
        x = pp.x;
        z = pp.z;
      }
      if (x === undefined) {
        if (!t.cond || !safe("trigcond", t.cond)) continue;
      } else {
        const dx = p.x - x,
          dz = p.z - z;
        if (dx * dx + dz * dz > t.r * t.r) continue;
        if (t.y !== undefined && Math.abs(p.y - t.y) > (t.dy || 6)) continue;
        if (t.cond && !safe("trigcond:" + t.id, t.cond)) continue;
      }
      if (t.once) FLAGS["trig_" + t.id] = true;
      else t._cool = G.time.real + (t.cooldown || 3);
      safe("trigger:" + t.id, t.fire);
    }
  }
  function tickLater(dt) {
    if (!LATER.length || !(dt > 0)) return;
    const due = [];
    for (let i = LATER.length - 1; i >= 0; i--) {
      const e = LATER[i];
      if (e.gen !== gen) {
        LATER.splice(i, 1);
        continue;
      }
      e.t -= dt;
      if (e.t <= 0) {
        LATER.splice(i, 1);
        due.push(e);
      }
    }
    for (let i = due.length - 1; i >= 0; i--) safe("later", due[i].fn);
  }

  function clearSession() {
    for (const h of SESSION.splice(0)) {
      safe("clearSession", () => {
        if (h.interactable) G.world.removeInteractable(h.interactable);
        if (h.pickup) {
          const p = h.pickup;
          if (live("items") && G.items.removePickup && p.key !== undefined) {
            G.items.removePickup(p);
            return;
          }
          if (typeof p.remove === "function") p.remove();
          else if (p.object3d && p.object3d.parent)
            p.object3d.parent.remove(p.object3d);
          if (p.interactable) G.world.removeInteractable(p.interactable);
        }
      });
    }
  }

  // Remember collected pickups (only the one the player is standing at counts).
  function onItemAdded(id) {
    const P = G.player && G.player.pos;
    for (const k in QX.pickups) {
      const pk = QX.pickups[k];
      if (pk.id !== id || FLAGS["got_" + k]) continue;
      const h = pk.handle;
      const gone =
        h &&
        (h.collected ||
          h.taken ||
          h.removed ||
          (h.object3d && !h.object3d.parent));
      if (
        gone ||
        (P &&
          pk.pos &&
          Math.hypot(P.x - pk.pos.x, P.z - pk.pos.z) < 4.5 &&
          Math.abs(P.y - (pk.pos.y || 0)) < 4)
      )
        FLAGS["got_" + k] = true;
    }
  }
  function onActorKilled(actor) {
    if (actor && actor.id && actor.qxNpc) FLAGS["dead_" + actor.id] = true;
  }

  // ------------------------------------------------------------------
  // Save / load (own flags only; quest state is saved by the quests module)
  // ------------------------------------------------------------------
  G.save.register("quests_extra", {
    save() {
      return { flags: FLAGS };
    },
    load(d) {
      FLAGS = (d && d.flags) || {};
    },
  });

  function resetAll() {
    FLAGS = {};
    gen++;
    LATER.length = 0;
    QX.npcs = {};
    QX.pickups = {};
    clearSession();
    for (const t of TRIGGERS) t._cool = 0;
    QX.run("reset");
  }

  // ------------------------------------------------------------------
  // Registration
  // ------------------------------------------------------------------
  G.registerModule({
    name: "quests_extra",
    order: 62,
    init() {
      QX.run("items"); // rpg (40) is up: define items
      if (QX.qlive()) QX.run("quests");
      else
        console.warn(
          "[quests_extra] quests module absent — quest content disabled (NPCs and props still spawn).",
        );
      QX.run("register"); // collect dialogue trees + terminals
      QX.registerAll();
      G.events.on("initDone", () => {
        QX.registerAll(); // ui_interact (70) is live now
        if (!worldBuilt) {
          worldBuilt = true;
          QX.run("world");
        }
      });
      G.events.on("reset", resetAll);
      G.events.on("newGame", (opts) => {
        if (!worldBuilt) {
          worldBuilt = true;
          QX.run("world");
        }
        QX.run("spawn", Object.assign({ newGame: true }, opts || {}));
      });
      G.events.on("loaded", () => {
        if (!worldBuilt) {
          worldBuilt = true;
          QX.run("world");
        }
        QX.run("spawn", { loaded: true });
        QX.run("loaded");
      });
      G.events.on("itemAdded", onItemAdded);
      G.events.on("actorKilled", onActorKilled);
    },
    update(dt, realDt) {
      tickLater(dt);
      // 'always' hooks run in every state (visibility of interior roots, etc.)
      for (const fn of HOOKS.always) safe("always", () => fn(dt, realDt));
      if (G.state !== "play") return;
      pollTriggers(realDt);
      for (const fn of HOOKS.update) safe("update", () => fn(dt, realDt));
    },
  });
})();
