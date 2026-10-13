// play-inline-518 01 — isstub
// Lines 19-366 of readable/play-inline-518.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  const A = (G.ambient = { __module: "ambient_life" });
  const K = (A._ = {});

  // ------------------------------------------------------------------
  // Tunables & hard performance limits
  // ------------------------------------------------------------------
  K.CFG = {
    BIRDS_MAX: 48, // instanced birds (3 draw calls total)
    RATS_MAX: 8, // instanced rats (1 draw call)
    CONVOY_LIVE_MAX: 2, // trade convoys materialised as actors at once
    CONVOY_SPAWN_R: 165, // materialise inside this radius (combat attaches actors < ~190 m)
    CONVOY_DESPAWN_R: 235, // dematerialise beyond this
    ENCOUNTER_DESPAWN_R: 260,
    FIREFIGHT_MAX_EVENTS: 64, // pooled scheduled shots/booms
    NIGHT_START: 22,
    NIGHT_END: 6,
  };

  // ------------------------------------------------------------------
  // Small utilities
  // ------------------------------------------------------------------
  K.now = () => (G.time ? G.time.elapsed : 0);
  /** Absolute game hours since day 1, 00:00. */
  K.gameHours = () =>
    G.time ? (Math.max(1, G.time.day || 1) - 1) * 24 + (G.time.hour || 0) : 0;
  K.day = () => (G.time ? G.time.day || 1 : 1);
  K.hour = () => (G.time ? G.time.hour || 0 : 12);
  K.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  K.lerp = (a, b, t) => a + (b - a) * t;
  K.rand = (a, b) => a + Math.random() * (b - a);
  K.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  K.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  K.chance = (p) => Math.random() < p;
  K.weighted = function (pairs) {
    // [[item, w], ...]
    let tot = 0;
    for (const p of pairs) tot += Math.max(0, p[1]);
    if (tot <= 0) return null;
    let r = Math.random() * tot;
    for (const p of pairs) {
      r -= Math.max(0, p[1]);
      if (r <= 0) return p[0];
    }
    return pairs[pairs.length - 1][0];
  };
  K.wrap = (a) => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };
  /** Yaw (player convention: 0 = -Z) that looks from (x0,z0) toward (x1,z1). */
  K.yawTo = (x0, z0, x1, z1) => Math.atan2(-(x1 - x0), -(z1 - z0));
  K.dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  K.v3 = () => new THREE.Vector3();

  K.P = () => G.player;
  K.playerOk = () => !!(G.player && G.player.pos && G.player.alive !== false);
  K.isInterior = (x) => !!(G.LAYOUT && G.LAYOUT.isInterior(x));
  K.playerOutdoors = () => K.playerOk() && !K.isInterior(G.player.pos.x);

  K.weather = function () {
    try {
      if (!G.isStub("atmos") && typeof G.atmos.getWeather === "function")
        return G.atmos.getWeather() || "clear";
    } catch (e) {
      /* ignore */
    }
    return "clear";
  };
  K.isStormy = () => {
    const w = K.weather();
    return w === "thunderstorm" || w === "dust";
  };
  K.isRainy = () => {
    const w = K.weather();
    return w === "rain" || w === "thunderstorm";
  };
  /** Dark outside (lighting-based when atmosphere is present). */
  K.isDark = function () {
    try {
      if (!G.isStub("atmos") && typeof G.atmos.isNight === "function")
        return !!G.atmos.isNight();
    } catch (e) {
      /* ignore */
    }
    const h = K.hour();
    return h < 5.5 || h > 20.5;
  };
  /** Settlement "bed time" (settlers sleep), with a per-actor jitter in hours. */
  K.isBedTime = function (jitter) {
    const h = (K.hour() + (jitter || 0) + 24) % 24;
    return h >= K.CFG.NIGHT_START || h < K.CFG.NIGHT_END;
  };

  // ------------------------------------------------------------------
  // Shared ids owned by other modules
  // ------------------------------------------------------------------
  K.SCRIP = "scrip"; // currency item id (also the merchant funds field)
  K.SFX_PAY = "pickup_scrip"; // sound id (src/sound)
  /** Character outfit by its new name when the characters module knows it, else a neutral stand-in. */
  K.outfit = function (want, fallback) {
    try {
      const list =
        !G.isStub("chars") && typeof G.chars.outfits === "function"
          ? G.chars.outfits()
          : null;
      if (list && list.indexOf(want) >= 0) return want;
    } catch (e) {
      /* ignore */
    }
    return fallback;
  };
  /** Merchant record for G.actors.spawn({merchant}). */
  K.merchant = function (funds, stock, extra) {
    return Object.assign({ stock }, extra || {}, { scrip: funds });
  };
  K.funds = (m) => (m && typeof m.scrip === "number" ? m.scrip : 0);
  K.setFunds = function (m, n) {
    if (m) m.scrip = n;
  };

  /** Player standing (-1000 … 1000; good deeds raise it). */
  K.standing = function () {
    try {
      return !G.isStub("rpg") && typeof G.rpg.standing === "number"
        ? G.rpg.standing
        : 0;
    } catch (e) {
      return 0;
    }
  };
  K.level = function () {
    try {
      return !G.isStub("rpg") && typeof G.rpg.level === "number"
        ? G.rpg.level
        : 1;
    } catch (e) {
      return 1;
    }
  };
  K.inCombat = function () {
    try {
      return (
        !G.isStub("combat") &&
        typeof G.combat.inCombat === "function" &&
        !!G.combat.inCombat()
      );
    } catch (e) {
      return false;
    }
  };
  K.qFlag = function (name) {
    try {
      return !G.isStub("quests") && typeof G.quests.flag === "function"
        ? G.quests.flag(name)
        : undefined;
    } catch (e) {
      return undefined;
    }
  };
  K.qDone = function (id) {
    try {
      return (
        !G.isStub("quests") &&
        typeof G.quests.isComplete === "function" &&
        !!G.quests.isComplete(id)
      );
    } catch (e) {
      return false;
    }
  };
  K.relation = function (a, b) {
    try {
      if (!G.isStub("combat") && typeof G.combat.relation === "function")
        return G.combat.relation(a, b);
    } catch (e) {
      /* ignore */
    }
    return "neutral";
  };

  // ------------------------------------------------------------------
  // Items / inventory (defensive)
  // ------------------------------------------------------------------
  K.itemExists = function (id) {
    if (id === K.SCRIP) return true;
    if (G.isStub("items") || typeof G.items.get !== "function") return false;
    try {
      return !!G.items.get(id);
    } catch (e) {
      return false;
    }
  };
  K.itemName = function (id) {
    if (id === K.SCRIP) return "Scrip";
    try {
      const d = G.items.get(id);
      if (d && d.name) return d.name;
    } catch (e) {
      /* ignore */
    }
    return id;
  };
  /** Filter an [[id, n], ...] list to items that exist. */
  K.stock = (list) =>
    list.filter((e) => K.itemExists(e[0])).map((e) => [e[0], e[1]]);
  K.give = function (id, n) {
    if (G.isStub("inventory")) return false;
    try {
      if (id === K.SCRIP && typeof G.inventory.addScrip === "function")
        G.inventory.addScrip(n);
      else if (K.itemExists(id)) G.inventory.add(id, n || 1);
      else return false;
      return true;
    } catch (e) {
      G.reportError("ambient:give", e);
      return false;
    }
  };
  /** Scrip the player carries / pay scrip (false when short). */
  K.scrip = function () {
    try {
      return !G.isStub("inventory") && typeof G.inventory.scrip === "function"
        ? G.inventory.scrip()
        : 0;
    } catch (e) {
      return 0;
    }
  };
  K.takeScrip = function (n) {
    if (K.scrip() < n) return false;
    try {
      if (typeof G.inventory.addScrip === "function") G.inventory.addScrip(-n);
      else G.inventory.remove(K.SCRIP, n);
      return true;
    } catch (e) {
      return false;
    }
  };
  K.addStanding = function (n, reason) {
    try {
      if (!G.isStub("rpg") && typeof G.rpg.addStanding === "function")
        G.rpg.addStanding(n, reason);
    } catch (e) {
      /* ignore */
    }
  };
  K.addXP = function (n, reason) {
    try {
      if (!G.isStub("rpg") && G.rpg.addXP) G.rpg.addXP(n, reason);
    } catch (e) {
      /* ignore */
    }
  };
  /** Attribute 1-10 by its new name (brawn, reflex, grit, wits, senses, presence). */
  K.attr = function (name) {
    try {
      if (G.isStub("rpg") || typeof G.rpg.attr !== "function") return 5;
      const v = G.rpg.attr(name);
      return typeof v === "number" && !isNaN(v) ? v : 5;
    } catch (e) {
      return 5;
    }
  };
  K.skill = function (id) {
    try {
      return !G.isStub("rpg") && typeof G.rpg.skill === "function"
        ? G.rpg.skill(id) || 0
        : 0;
    } catch (e) {
      return 0;
    }
  };
  /** Define a note item once (G.items must be present). extra: e.g. {learn: lockId} (teaches a code on pickup). */
  K.defineNote = function (id, name, title, text, value, extra) {
    if (G.isStub("items") || typeof G.items.define !== "function") return false;
    try {
      if (G.items.get(id)) return true;
      G.items.define(
        Object.assign(
          {
            id,
            name,
            type: "note",
            title,
            text,
            weight: 0,
            value: value || 0,
            desc: title,
          },
          extra || {},
        ),
      );
      return true;
    } catch (e) {
      return false;
    }
  };
  /** Define a key item once. */
  K.defineKey = function (id, name, desc) {
    if (G.isStub("items") || typeof G.items.define !== "function") return false;
    try {
      if (G.items.get(id)) return true;
      G.items.define({
        id,
        name,
        type: "key",
        weight: 0,
        value: 0,
        tags: ["key"],
        mesh: "key",
        desc,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Locks: keys / codes / passcodes (G.locks). While the locks module is absent the lock simply opens.
  // ------------------------------------------------------------------
  K.openLock = function (spec, onOpen) {
    try {
      if (!G.isStub("locks") && G.locks && typeof G.locks.open === "function") {
        if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
          onOpen();
          return;
        }
        G.locks.open(spec, onOpen);
        return;
      }
    } catch (e) {
      G.reportError && G.reportError("locks:" + spec.id, e);
    }
    onOpen();
  };
  K.registerLock = function (spec) {
    try {
      if (!G.isStub("locks") && G.locks.register) G.locks.register(spec);
    } catch (e) {
      /* ignore */
    }
  };
