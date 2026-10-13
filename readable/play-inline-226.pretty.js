/* src/landmark_interiors/05_game.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 05_game.js
 * Defensive gameplay helpers shared by the interiors: quest flags, item
 * definitions, terminals, dialogues, named NPC spawning, interactables.
 * Every call goes through the contract APIs at call time (G.isStub).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
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
  LI.LOCKS = {
    // UN General Assembly
    un_sg_safe: {
      id: "li_un_sg_safe",
      label: "Secretary-General's Safe",
      kind: "safe",
      code: "2410",
      hint: "A memo on the UN records terminal (strongroom) gives the combination: UN Day, 24 October.",
      learnedFrom: "UN records terminal — memo on the Secretary-General's suit",
    },
    un_records_term: {
      id: "li_un_records_term",
      label: "UN Records Terminal",
      kind: "terminal",
      passcode: "PEACEKEEPER",
      hint: "The staff notice on the visitor centre terminal in the GA lobby.",
      learnedFrom: "UN visitor centre terminal — staff notice",
    },
    un_project_term: {
      id: "li_un_project_term",
      label: "Project Knickerbocker Terminal",
      kind: "terminal",
      passcode: "MORNINGSTAR",
      hint: "Major Keel's orders lie on the desk beside the terminal; Keel also gives it to a guest she trusts.",
      learnedFrom: ["Orders: Science Liaison Keel", "Major Keel"],
    },
    // 30 Rockefeller Plaza
    rock_war_term: {
      id: "li_rock_war_term",
      label: "War Room Terminal",
      kind: "terminal",
      passcode: "LONGWATCH",
      hint: "Lancer Dalca gives it out; it is also chalked on the case of the recall tape reel in the war room.",
      learnedFrom: ["Lancer Dalca", "Tape reel: Recall Order No. 5"],
    },
    // NYSE
    nyse_board_term: {
      id: "li_nyse_board_term",
      label: "NYSE Governors' Terminal",
      kind: "terminal",
      passcode: "BELLRINGER",
      hint: "The Board of Governors minutes on the boardroom table.",
      learnedFrom: "Board of Governors — Minutes",
    },
    nyse_gov_safe: {
      id: "li_nyse_gov_safe",
      label: "Governors' Safe",
      kind: "safe",
      code: "1817",
      hint: 'The governors\' terminal (boardroom), entry "Strongroom Access".',
      learnedFrom: "NYSE governors' terminal",
    },
    nyse_strongroom: {
      id: "li_nyse_strongroom",
      label: "Exchange Strongroom",
      kind: "door",
      key: "key_exchange_vault",
      code: "1792",
      hint: "Bull Market Bruno carries the key; the dial combination is on the governors' terminal.",
      keyFrom: '"Bull Market" Bruno',
      learnedFrom: "NYSE governors' terminal",
    },
    nyse_box_1929: {
      id: "li_nyse_box_1929",
      label: "Deposit Box 1929",
      kind: "safe",
      code: "1029",
      hint: 'The governors\' terminal (boardroom), entry "Strongroom Access".',
      learnedFrom: "NYSE governors' terminal",
    },
    nyse_cage: {
      id: "li_nyse_cage",
      label: "Pit Cage",
      kind: "door",
      key: "li_pit_key",
      hint: "Bruno carries the cage key; a spare lies at Post 11 on the trading floor.",
      keyFrom: ['"Bull Market" Bruno', "Post 11 (trading floor)"],
    },
    // Woolworth
    ww_office_term: {
      id: "li_ww_office_term",
      label: "Woolworth Accounts Terminal",
      kind: "terminal",
      passcode: "CATHEDRAL",
      hint: "Penny Dreadful's standing orders (tape reel in the five-and-dime den).",
      learnedFrom: "Tape reel: Five & Dime Orders",
    },
    ww_mezz_safe: {
      id: "li_ww_mezz_safe",
      label: "Petty Cash Safe",
      kind: "safe",
      code: "0424",
      hint: 'The accounts terminal on the office floor, entry "Petty Cash".',
      learnedFrom: "Woolworth accounts terminal",
    },
    ww_strongbox: {
      id: "li_ww_strongbox",
      label: "Penny's Strongbox",
      kind: "container",
      key: "li_ww_strongbox_key",
      code: "1879",
      hint: "Penny Dreadful carries the key; Squint's pencil note on the founder's letter (office floor) gives the dial.",
      keyFrom: "Penny Dreadful",
      learnedFrom: "Letter on the Founder's Desk",
    },
    // City Hall
    ch_mayor_safe: {
      id: "li_ch_mayor_safe",
      label: "The Mayor's Safe",
      kind: "safe",
      code: "1803",
      hint: "The Mayor's unaired address (tape reel on the Blue Room desk).",
      learnedFrom: "Tape reel: Mayor's Address",
    },
    ch_council_term: {
      id: "li_ch_council_term",
      label: "Speaker's Terminal",
      kind: "terminal",
      passcode: "QUORUM",
      hint: "The margin of the Council agenda in the chamber.",
      learnedFrom: "Council Agenda",
    },
    // Flatiron
    fl_ledger_term: {
      id: "li_fl_ledger_term",
      label: "Post Master's Ledger",
      kind: "terminal",
      passcode: "SKIDOO",
      hint: "The Wedge's guest ledger (Mavis's note) or Lorena Hightower once Nate is home.",
      learnedFrom: ["The Wedge — Guest Ledger", "Lorena Hightower"],
    },
    fl_post_safe: {
      id: "li_fl_post_safe",
      label: "Post Master's Safe",
      kind: "safe",
      code: "1902",
      hint: 'The Post Master\'s ledger terminal, entry "The Safe".',
      learnedFrom: "Post Master's ledger terminal",
    },
    fl_room22: {
      id: "li_fl_room22",
      label: "The Wedge, Room 22",
      kind: "door",
      key: "li_wedge_key",
      hint: "Rent it from Mavis at the reception.",
      keyFrom: "Mavis Wojcik (rent)",
    },
  };
  LI.readyFns.push(() => {
    for (const k in LI.LOCKS) LI.registerLock(LI.LOCKS[k]);
  });
  /** Items with `learn: lockId` teach their code when read (the locks module also does this on pickup). */
  try {
    G.events.on("noteRead", (id) => {
      if (
        typeof id !== "string" ||
        id.indexOf("li_") !== 0 ||
        !live("items") ||
        !G.items.get
      )
        return;
      const d = G.items.get(id);
      if (d && d.learn) LI.learnCode(d.learn, d.name);
    });
  } catch (e) {
    /* events absent */
  }
  /** Terminal entry text that also logs a code when printed. */
  LI.codeText = (lockKey, text) => {
    const s = LI.LOCKS[lockKey];
    return {
      learn: s.id,
      text: () => {
        LI.learnCode(s.id, s.learnedFrom && [].concat(s.learnedFrom)[0]);
        return text;
      },
    };
  };

  /** The hero's name (never hard-coded). */
  LI.hero = () => (G.HERO && G.HERO.name) || "stranger";

  /** Relation helpers */
  LI.inCell = (C, p) =>
    p && Math.abs(p.x - C.O.x) < 170 && Math.abs(p.z - C.O.z) < 170;
})();
