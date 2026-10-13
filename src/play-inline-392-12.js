// play-inline-392 12 — isstub
// Lines 3472-3714 of readable/play-inline-392.pretty.js (statement-aligned).
  K.take = (id, n) => {
    if (!G.isStub("inventory") && G.inventory.remove)
      K.safe("take " + id, () => G.inventory.remove(id, n || 1));
  };
  /** Scrip (federal ration scrip). */
  K.scrip = (n) => {
    if (G.isStub("inventory")) return;
    K.safe("scrip", () => {
      const inv = G.inventory;
      if (typeof inv.addScrip === "function") return inv.addScrip(n);
      return n > 0 ? inv.add("scrip", n) : inv.remove("scrip", -n);
    });
  };
  K.scripCount = () => {
    if (G.isStub("inventory")) return 0;
    try {
      const inv = G.inventory;
      if (typeof inv.scrip === "function") return inv.scrip() || 0;
      return inv.count ? inv.count("scrip") || 0 : 0;
    } catch (e) {
      return 0;
    }
  };
  /** Standing (reputation) change. */
  K.standing = (n, why) => {
    if (G.isStub("rpg")) return;
    K.safe("standing", () => {
      if (typeof G.rpg.addStanding === "function")
        return G.rpg.addStanding(n, why);
    });
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

  /** First item id of the list that the item registry knows (first known id wins). */
  K.firstItem = (...ids) => ids.find((id) => K.itemExists(id)) || ids[0];

  // ---- locks: keys, codes and passcodes (G.locks; registered at initDone) ----
  K._locks = K._locks || [];
  K._learnMap = K._learnMap || {};
  K._locksLive = false;
  const _regNow = (s) => {
    if (!G.isStub("locks") && G.locks.register) {
      try {
        G.locks.register(s);
      } catch (e) {
        G.reportError("poi_village3:lock " + s.id, e);
      }
    }
  };
  /** Declare a lock spec {id,label,key?,code?,passcode?,hint}; returns the spec so it can be passed inline as `lock:`. */
  K.regLock = function (spec) {
    if (!spec || !spec.id) return spec;
    if (!K._locks.some((s) => s.id === spec.id)) K._locks.push(spec);
    if (K._locksLive) _regNow(spec);
    return spec;
  };
  K.lockSpec = (id) => K._locks.find((s) => s.id === id) || null;
  /** The player found the code/passcode for lockId (note read, dialogue heard, scrawl read…). */
  K.learn = function (lockId) {
    if (!G.isStub("locks") && G.locks.learn) {
      try {
        G.locks.learn(lockId);
      } catch (e) {
        G.reportError("poi_village3:learn " + lockId, e);
      }
    }
  };
  /** Reading / picking up this item teaches these locks. */
  K.learnOn = function (itemId, lockId) {
    const l = (K._learnMap[itemId] = K._learnMap[itemId] || []);
    if (l.indexOf(lockId) < 0) l.push(lockId);
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
  /** Mark a lock open from a scripted source (a terminal releasing a locker, a boss's key cylinder…). */
  K.lockUnlock = (id) => {
    try {
      if (!G.isStub("locks") && G.locks.unlock) G.locks.unlock(id);
    } catch (e) {
      G.reportError("poi_village3:unlock " + id, e);
    }
  };
  /** Interact with a lock: G.locks handles key / keypad / passcode; falls back to key-only when the registry is absent. */
  K.lockOpen = function (spec, onOpen) {
    if (typeof spec === "string") spec = K.lockSpec(spec) || { id: spec };
    if (!G.isStub("locks") && G.locks.open) {
      try {
        return G.locks.open(spec, onOpen);
      } catch (e) {
        G.reportError("poi_village3:lockOpen " + spec.id, e);
        return;
      }
    }
    if (spec.key && K.has(spec.key)) {
      onOpen();
      return;
    }
    K.sfx("door_locked");
    K.notify("Locked.");
  };
  G.events.on("initDone", () => {
    K._locksLive = true;
    K._locks.forEach(_regNow);
  });
  G.events.on("noteRead", (id) => {
    (K._learnMap[id] || []).forEach(K.learn);
  });
  G.events.on("itemAdded", (id) => {
    (K._learnMap[id] || []).forEach(K.learn);
  });
