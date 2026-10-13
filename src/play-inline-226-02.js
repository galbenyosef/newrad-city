// play-inline-226 02 — live
// Lines 13-314 of readable/play-inline-226.pretty.js (statement-aligned).
  const LI = G._li;
  const live = (ns) => !G.isStub(ns) && G[ns];

  const Q = (LI.q = {
    live: () => !!live("quests"),
    flag(n) {
      try {
        return live("quests") && G.quests.flag
          ? G.quests.flag(n)
          : LI.localFlags[n];
      } catch (e) {
        return undefined;
      }
    },
    set(n, v) {
      v = v === undefined ? true : v;
      LI.localFlags[n] = v;
      try {
        if (live("quests") && G.quests.setFlag) G.quests.setFlag(n, v);
      } catch (e) {
        /* */
      }
      return v;
    },
    active(id) {
      try {
        return live("quests") && G.quests.isActive
          ? !!G.quests.isActive(id)
          : false;
      } catch (e) {
        return false;
      }
    },
    done(id) {
      try {
        return live("quests") && G.quests.isComplete
          ? !!G.quests.isComplete(id)
          : false;
      } catch (e) {
        return false;
      }
    },
    started(id) {
      try {
        return live("quests") && G.quests.isStarted
          ? !!G.quests.isStarted(id)
          : Q.active(id) || Q.done(id);
      } catch (e) {
        return false;
      }
    },
    stage(id) {
      try {
        return live("quests") && G.quests.stage ? G.quests.stage(id) : null;
      } catch (e) {
        return null;
      }
    },
    start(id, st) {
      try {
        if (live("quests"))
          return G.quests.start(id, st ? { stage: st } : undefined);
      } catch (e) {
        G.reportError("landmark_interiors:quest " + id, e);
      }
      return false;
    },
    setStage(id, st) {
      try {
        if (live("quests")) return G.quests.setStage(id, st);
      } catch (e) {
        G.reportError("landmark_interiors:quest " + id, e);
      }
      return false;
    },
    complete(id) {
      try {
        if (live("quests")) return G.quests.complete(id);
      } catch (e) {
        G.reportError("landmark_interiors:quest " + id, e);
      }
      return false;
    },
    define(def) {
      try {
        if (live("quests") && G.quests.define) G.quests.define(def);
      } catch (e) {
        G.reportError("landmark_interiors:quest define " + def.id, e);
      }
    },
  });
  LI.localFlags = LI.localFlags || {};
  LI.resetFns.push(() => {
    LI.localFlags = {};
  });

  LI.has = (id) => {
    try {
      return live("inventory") ? G.inventory.count(id) > 0 : false;
    } catch (e) {
      return false;
    }
  };
  LI.give = (id, n) => {
    try {
      if (live("inventory")) G.inventory.add(id, n || 1);
    } catch (e) {
      G.reportError("landmark_interiors:give " + id, e);
    }
  };
  LI.take = (id, n) => {
    try {
      if (live("inventory")) return G.inventory.remove(id, n || 1);
    } catch (e) {
      /* */
    }
    return 0;
  };
  /** Ration scrip (the currency): balance, gain, spend. */
  LI.scrip = () => {
    try {
      return live("inventory") && G.inventory.scrip ? G.inventory.scrip() : 0;
    } catch (e) {
      return 0;
    }
  };
  LI.giveScrip = (n) => {
    try {
      if (live("inventory") && G.inventory.addScrip) G.inventory.addScrip(n);
    } catch (e) {
      G.reportError("landmark_interiors:scrip", e);
    }
  };
  LI.payScrip = (n) => {
    if (LI.scrip() < n) return false;
    LI.giveScrip(-n);
    return true;
  };
  LI.xp = (n, why) => {
    try {
      if (live("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* */
    }
  };
  /** Standing (the rpg's moral ledger): + trusted, − feared. */
  LI.standing = (n, why) => {
    try {
      if (live("rpg")) G.rpg.addStanding(n, why);
    } catch (e) {
      /* */
    }
  };
  LI.notify = (t) => {
    try {
      G.notify(t);
    } catch (e) {
      /* */
    }
  };
  LI.sfx = (n, o) => {
    try {
      G.sfx.play(n, o);
    } catch (e) {
      /* */
    }
  };
  LI.skill = (s) => {
    try {
      return live("rpg") ? G.rpg.skill(s) : 0;
    } catch (e) {
      return 0;
    }
  };

  /** Define items (notes, tape reels, keys, uniques) at initDone; skips ids that already exist. */
  LI.defineItems = function (list) {
    if (!live("items") || !G.items.define) return;
    for (const d of list) {
      try {
        if (G.items.get && G.items.get(d.id)) continue;
        const def = Object.assign({ weight: 0, value: 0 }, d);
        if (def.type === "note" && !def.mesh) def.mesh = "note";
        if (def.type === "key" && !def.mesh) def.mesh = "key";
        G.items.define(def);
      } catch (e) {
        G.reportError("landmark_interiors:item " + d.id, e);
      }
    }
  };
  LI.terminal = (id, def) => {
    try {
      if (live("terminals") && G.terminals.register)
        G.terminals.register(id, def);
    } catch (e) {
      G.reportError("landmark_interiors:terminal " + id, e);
    }
  };
  LI.dialogue = (id, tree) => {
    try {
      if (live("dialogue") && G.dialogue.register)
        G.dialogue.register(id, tree);
    } catch (e) {
      G.reportError("landmark_interiors:dialogue " + id, e);
    }
  };

  /** Actor by stable id (live). */
  LI.npc = (id) => {
    try {
      return live("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  /**
   * Spawn a named NPC at a world position (Vector3 with .yaw). def: G.actors.spawn def minus pos.
   * Replaces a stale actor with the same id. Returns the actor or null.
   */
  LI.spawnNPC = function (def, at) {
    if (!live("actors") || !G.actors.spawn || !at) return null;
    try {
      const old = LI.npc(def.id);
      if (old && !old.removed) {
        try {
          G.actors.remove(old);
        } catch (e) {
          /* */
        }
      }
      const y = G.world.groundHeight(at.x, at.z, (at.y || 0) + 0.6, 0.3);
      const d = Object.assign(
        { yaw: at.yaw || 0, home: { x: at.x, z: at.z, r: def.homeR || 3 } },
        def,
        { pos: { x: at.x, y, z: at.z } },
      );
      delete d.homeR;
      const a = G.actors.spawn(d);
      return a || null;
    } catch (e) {
      G.reportError("landmark_interiors:npc " + def.id, e);
      return null;
    }
  };
  /** World interactable at a world position. */
  LI.interact = function (pos, label, verb, onInteract, o) {
    try {
      return G.world.addInteractable(
        Object.assign(
          { pos, label, verb: verb || "Use", onInteract, radius: 0.9 },
          o || {},
        ),
      );
    } catch (e) {
      return null;
    }
  };
  // ------------------------------------------------------------------
  // Locks: keys / codes / passcodes (G.locks). While the locks module is absent the lock simply opens.
  // ------------------------------------------------------------------
  LI.openLock = function (spec, onOpen) {
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
  LI.registerLock = (spec) => {
    try {
      if (!G.isStub("locks") && G.locks.register) G.locks.register(spec);
    } catch (e) {
      /* */
    }
  };
  LI.learnCode = (id, src) => {
    try {
      if (!G.isStub("locks") && G.locks.learn) G.locks.learn(id, src);
    } catch (e) {
      /* */
    }
  };
  LI.lockOpen = (id) => {
    try {
      return !G.isStub("locks") && G.locks.isOpen
        ? !!G.locks.isOpen(id)
        : false;
    } catch (e) {
      return false;
    }
  };
  /**
   * Every lock in the six interiors (registered at initDone). Where each key / code is placed:
   * the `hint` says it in plain words; `learnedFrom` / `keyFrom` feed the locks audit.
   */
