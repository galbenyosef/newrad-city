// play-inline-332 12 — locks
// Lines 3472-3755 of readable/play-inline-332.pretty.js (statement-aligned).
  K.take = (id, n) => {
    if (!G.isStub("inventory") && G.inventory.remove)
      K.safe("take " + id, () => G.inventory.remove(id, n || 1));
  };
  /** Scrip (federal ration scrip) and Standing; the rpg API names settle during the rebrand, so resolve at call time. */
  K.scrip = (n) => {
    if (G.isStub("inventory")) return;
    const I = G.inventory;
    K.safe("scrip", () =>
      I.addScrip
        ? I.addScrip(n)
        : n >= 0
          ? I.add("scrip", n)
          : I.remove("scrip", -n),
    );
  };
  K.scripCount = () => {
    if (G.isStub("inventory")) return 0;
    const I = G.inventory;
    try {
      return I.scrip ? I.scrip() : I.count ? I.count("scrip") : 0;
    } catch (e) {
      return 0;
    }
  };
  K.standing = (n, why) => {
    if (G.isStub("rpg")) return;
    const R = G.rpg;
    if (R.addStanding) K.safe("standing", () => R.addStanding(n, why));
  };
  K.xp = (n, why) => {
    if (!G.isStub("rpg") && G.rpg.addXP)
      K.safe("xp", () => G.rpg.addXP(n, why));
  };
  K.skill = (id) => {
    try {
      return !G.isStub("rpg") && G.rpg.skill ? G.rpg.skill(id) : 0;
    } catch (e) {
      return 0;
    }
  };
  K.notify = (t) => {
    try {
      G.notify(t);
    } catch (e) {
      /* */
    }
  };
  K.sfx = (name, pos, o) => {
    try {
      if (!G.isStub("sfx"))
        return G.sfx.play(name, Object.assign({ pos }, o || {}));
    } catch (e) {
      /* */
    }
    return null;
  };
  K.itemExists = (id) => {
    try {
      return !G.isStub("items") && !!(G.items.get && G.items.get(id));
    } catch (e) {
      return false;
    }
  };
  /** Define an item only if missing. */
  K.defineItem = (def) => {
    if (G.isStub("items") || !G.items.define) return;
    if (!K.itemExists(def.id))
      K.safe("item " + def.id, () => G.items.define(def));
  };
  /** Merchant stock: explicit entries that exist + rolled table. */
  K.stock = function (list, table, lvl) {
    const out = [];
    for (const [id, n] of list) if (K.itemExists(id)) out.push([id, n]);
    if (table && !G.isStub("items") && G.items.rollLoot) {
      try {
        const r = G.items.rollLoot(table, lvl || 3);
        if (Array.isArray(r)) for (const e of r) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    return out;
  };
  K.qflag = (n) => {
    try {
      return !G.isStub("quests") && G.quests.flag
        ? G.quests.flag(n)
        : undefined;
    } catch (e) {
      return undefined;
    }
  };
  K.setQFlag = (n, v) => {
    try {
      if (!G.isStub("quests") && G.quests.setFlag) G.quests.setFlag(n, v);
    } catch (e) {
      /* */
    }
  };
  K.q = {
    active: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isActive(id);
      } catch (e) {
        return false;
      }
    },
    done: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isComplete(id);
      } catch (e) {
        return false;
      }
    },
    stage: (id) => {
      try {
        return !G.isStub("quests") ? G.quests.stage(id) : null;
      } catch (e) {
        return null;
      }
    },
    start: (id, o) =>
      K.safe("qstart " + id, () => {
        if (
          !G.isStub("quests") &&
          !G.quests.isActive(id) &&
          !G.quests.isComplete(id)
        )
          G.quests.start(id, o);
      }),
    set: (id, st) =>
      K.safe("qstage " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id))
          G.quests.setStage(id, st);
      }),
    complete: (id) =>
      K.safe("qdone " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id)) G.quests.complete(id);
      }),
    fail: (id) =>
      K.safe("qfail " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id)) G.quests.fail(id);
      }),
    started: (id) => {
      try {
        return (
          !G.isStub("quests") &&
          (G.quests.isActive(id) ||
            G.quests.isComplete(id) ||
            (G.quests.stage && G.quests.stage(id) != null))
        );
      } catch (e) {
        return false;
      }
    },
  };

  // ---- locks: keys, codes and passcodes (G.locks; specs registered at initDone) ----
  K._locks = K._locks || [];
  K._learnMap = K._learnMap || {};
  K._locksLive = false;
  const regNow = (s) => {
    if (!G.isStub("locks") && G.locks.register) {
      try {
        G.locks.register(s);
      } catch (e) {
        G.reportError("poi_eastvillage:lock " + s.id, e);
      }
    }
  };
  /** Declare a lock spec {id, label, key?, code?, passcode?, hint}; returns the spec so it can be passed inline as `lock:`. */
  K.regLock = function (spec) {
    if (!spec || !spec.id) return spec;
    if (!K._locks.some((s) => s.id === spec.id)) K._locks.push(spec);
    if (K._locksLive) regNow(spec);
    return spec;
  };
  K.lockSpec = (id) => K._locks.find((s) => s.id === id) || null;
  /** The player found the code / passcode for lockId (note read, dialogue heard, scrawl read...). */
  K.learn = function (lockId) {
    if (!G.isStub("locks") && G.locks.learn) {
      try {
        G.locks.learn(lockId);
      } catch (e) {
        G.reportError("poi_eastvillage:learn " + lockId, e);
      }
    }
  };
  /** Reading (or picking up) this item teaches these locks. */
  K.learnOn = function (itemId, lockId) {
    (K._learnMap[itemId] = K._learnMap[itemId] || []).push(lockId);
  };
  K.lockIsOpen = (id) => {
    try {
      return !G.isStub("locks") && G.locks.isOpen
        ? !!G.locks.isOpen(id)
        : false;
    } catch (e) {
      return false;
    }
  };
  /** Interact with a lock: G.locks handles key / keypad / passcode; key-only fallback while the registry is absent. */
  K.lockOpen = function (spec, onOpen) {
    if (typeof spec === "string") spec = K.lockSpec(spec) || { id: spec };
    if (!G.isStub("locks") && G.locks.open) {
      try {
        G.locks.open(spec, onOpen);
      } catch (e) {
        G.reportError("poi_eastvillage:lockOpen " + spec.id, e);
      }
      return;
    }
    if (spec.key && K.has(spec.key)) {
      onOpen();
      return;
    }
    K.sfx("door_locked");
    K.notify("Locked.");
  };
  /** "Read" interactable (wall scrawl, tag, plaque) that teaches a code. pos: world Vector3. */
  K.scrawl = function (pos, label, text, lockId) {
    return K.safe("scrawl " + label, () =>
      G.world.addInteractable({
        pos,
        radius: 0.6,
        range: 2.4,
        label,
        verb: "Read",
        onInteract() {
          K.notify(label + " — " + text);
          K.sfx("ui_click");
          if (lockId) K.learn(lockId);
        },
      }),
    );
  };
  /** Same, deferred: declare now (audit), build the interactable at initDone. */
  K.scrawlAt = function (pos, label, text, lockId) {
    if (lockId) K.learnFrom(lockId, "scrawl: " + label);
    G.events.on("initDone", () => K.scrawl(pos, label, text, lockId));
  };
  /** Declare (for G.locks.audit) where a code is learned / a key is handed over by script. */
  K._learnSrc = K._learnSrc || [];
  K._keySrc = K._keySrc || [];
  K.learnFrom = (lockId, label) => {
    K._learnSrc.push([lockId, label]);
    if (K._locksLive && !G.isStub("locks") && G.locks.learnableFrom)
      K.safe("learnsrc", () => G.locks.learnableFrom(lockId, label));
  };
  K.keyFrom = (itemId, label) => {
    K._keySrc.push([itemId, label]);
    if (K._locksLive && !G.isStub("locks") && G.locks.obtainableFrom)
      K.safe("keysrc", () => G.locks.obtainableFrom(itemId, label));
  };
  G.events.on("initDone", () => {
    K._locksLive = true;
    K._locks.forEach(regNow);
    if (G.isStub("locks")) return;
    for (const it in K._learnMap)
      for (const id of K._learnMap[it])
        K.safe(
          "learnsrc",
          () =>
            G.locks.learnableFrom &&
            G.locks.learnableFrom(id, "item: " + it + "#" + it),
        );
    for (const [id, l] of K._learnSrc)
      K.safe(
        "learnsrc",
        () => G.locks.learnableFrom && G.locks.learnableFrom(id, l),
      );
    for (const [it, l] of K._keySrc)
      K.safe(
        "keysrc",
        () => G.locks.obtainableFrom && G.locks.obtainableFrom(it, l),
      );
  });
  G.events.on("noteRead", (id) => {
    (K._learnMap[id] || []).forEach(K.learn);
  });
  G.events.on("itemAdded", (id) => {
    (K._learnMap[id] || []).forEach(K.learn);
  });
