// play-inline-554 03 — the
// Lines 498-803 of readable/play-inline-554.pretty.js (statement-aligned).
  const BOOKS = [
    {
      id: "q_book_fusion",
      key: "book_fusion",
      label: "Practical Cold Fusion",
      anchors: ["book1", "books", "stacks"],
      off: { x: 22, z: -8 },
    },
    {
      id: "q_book_armor",
      key: "book_armor",
      label: "Exo-rig Field Servicing Manual",
      anchors: ["book2", "loot1", "reading_room"],
      off: { x: 30, z: 6 },
    },
    {
      id: "q_book_rotorcraft",
      key: "book_rotorcraft",
      label: "Rotorcraft for the Home Mechanic",
      anchors: ["book3", "spawn4", "steps"],
      off: { x: 34, z: 20 },
    },
  ];
  /** Kong lives on the observation deck: guide the player via lobby door → express elevator. */
  function kongMarker() {
    const k = L.npc("esb_kong");
    const kp = k && !k.dead ? k.pos : null;
    const P = G.player.pos;
    if (!kp) return { x: ESB.x, z: ESB.z, label: "Empire State Building" };
    if (kp.y < 60 || P.y > 100)
      return { x: kp.x, z: kp.z, y: kp.y, label: "KONG" };
    const doors = L.doors();
    const inLobby =
      P.x >= G.LAYOUT.INTERIOR_X_MIN && Math.hypot(P.x - 4000, P.z - 800) < 200;
    if (inLobby) {
      const e = doors.find(
        (d) => d.def.pos.x >= 2500 && d.def.target && d.def.target.y > 100,
      );
      if (e)
        return {
          x: e.def.pos.x,
          z: e.def.pos.z,
          label: "Express Elevator (to KONG)",
        };
    }
    const lobby = L.doorInto("empire_lobby");
    if (lobby)
      return {
        x: lobby.def.pos.x,
        z: lobby.def.pos.z,
        label: "Empire State Lobby (KONG is on the 86th floor)",
      };
    return { x: kp.x, z: kp.z, label: "KONG" };
  }
  /** Reading a catalogue entry ticks "Overdue"'s optional lookup (returns '' for the text). */
  function catalogRead() {
    if (!L.flag("nypl_catalog_read")) {
      L.setFlag("nypl_catalog_read");
      if (Q.isActive("sq_overdue")) L.refresh("sq_overdue");
    }
    return "";
  }
  function bookCount() {
    return BOOKS.filter((b) => L.has(b.id)).length;
  }

  G.events.on("itemAdded", (id) => {
    if (BOOKS.some((b) => b.id === id)) {
      if (!Q.isStarted("sq_overdue")) Q.start("sq_overdue");
      if (Q.stage("sq_overdue") === "books") {
        if (bookCount() >= 3) Q.setStage("sq_overdue", "return");
        else L.refresh("sq_overdue");
      }
    }
    if (id === "q_knickerbocker_core") onCore();
    if (
      id === "q_note_betty_ledger" &&
      (Q.stage("sq_exchange") === "hunt" || !Q.isStarted("sq_exchange"))
    ) {
      L.setFlag("betty_ledger_stolen");
      // A clean lift: Betty alive and nobody at the Exchange ever spotted you.
      if (!L.flag("exchange_alerted") && L.alive("ws_betty")) {
        L.setFlag("betty_ledger_ghost");
        L.xp(50, "Stealth: Insider trading");
      }
      if (!Q.isStarted("sq_exchange"))
        Q.start("sq_exchange", { stage: "report" });
      else Q.setStage("sq_exchange", "report");
    }
    if (id === "q_reel_directive_7a") L.setFlag("knows_directive");
    if (id === "q_note_ortiz_blotter") learn(LOCKS.un.id);
  });
  // "Hostile Takeover" ghost run: were you ever seen at the Exchange?
  function nearExchange() {
    const P = G.player.pos,
      pts = [];
    const b = L.npc("ws_betty");
    if (b && !b.dead) pts.push(b.pos);
    if (L.pickups.betty_ledger) pts.push(L.pickups.betty_ledger.pos);
    return pts.some((q) => Math.hypot(P.x - q.x, P.z - q.z) < 60);
  }
  G.events.on("playerDetected", (a) => {
    if (
      a &&
      a.faction === "raiders" &&
      !L.flag("betty_ledger_stolen") &&
      nearExchange()
    )
      L.setFlag("exchange_alerted");
  });
  let xcT = 0;
  L.hook("update", function (dt, realDt) {
    xcT -= realDt;
    if (xcT > 0) return;
    xcT = 0.5;
    if (
      L.flag("exchange_alerted") ||
      L.flag("betty_ledger_stolen") ||
      L.flag("sq_exchange_done")
    )
      return;
    const inCombat =
      !G.isStub("combat") && G.combat.inCombat && G.combat.inCombat();
    if (inCombat && nearExchange()) {
      L.setFlag("exchange_alerted");
      if (Q.isActive("sq_exchange")) L.refresh("sq_exchange");
    }
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "esb_kong") {
      L.setFlag("kong_dead");
      L.setFlag("ms_kong", "dead");
    }
    if (a.id === "ws_betty") {
      L.setFlag("betty_dead");
      if (Q.stage("sq_exchange") === "hunt")
        Q.setStage("sq_exchange", "report");
      else if (!Q.isStarted("sq_exchange")) {
        Q.start("sq_exchange", { stage: "report" });
      }
    }
    if (a.id === "con_hale") {
      L.setFlag("hale_dead");
      // Hale was the Continuity turn-in: with her gone the core is simply yours
      if (Q.stage("mq05") === "return_con" && Q.isActive("mq05"))
        Q.complete("mq05");
    }
    if (a.id === "cov_stroud") {
      L.setFlag("stroud_dead");
      if (Q.stage("mq05") === "return_cov" && Q.isActive("mq05"))
        Q.complete("mq05");
    }
  });

  /** The core is in hand: remember it (mq05 may not have started yet) and move mq05 on if it is waiting for it.
   *  Never starts or skips other main quests: the spine (61_ms_core.js) does that. */
  function onCore() {
    if (!L.flag("core_obtained")) L.setFlag("core_obtained");
    if (Q.stage("mq05") === "core" && Q.isActive("mq05")) routeCore();
  }
  /** mq05 with the core in hand: to Stroud (Covenant), to Hale (Continuity), or kept (alone / patron dead). */
  function routeCore() {
    const f = faction();
    if (f === "covenant" && !L.flag("stroud_dead"))
      Q.setStage("mq05", "return_cov");
    else if (
      f === "continuity" &&
      !L.flag("hale_dead") &&
      !L.flag("con_hostile")
    )
      Q.setStage("mq05", "return_con");
    else Q.complete("mq05");
  }
  /** Evidence the player could play for Hale (mq04 / Act III): Directive 7-A, Nell Brady's reels, the kept Deed Ledger. */
  function haleEvidence() {
    return (
      L.has("q_reel_directive_7a") ||
      !!L.flag("ms_token_nell") ||
      L.flag("ms_deed_ledger") === "kept"
    );
  }
  function haleDefects() {
    if (L.flag("hale_defects")) return;
    L.setFlag("hale_defects");
    L.setFlag("ms_hale_defects");
    L.xp(60, "Hale changes sides");
    L.standing(25, "Showed Hale the truth");
    if (Q.isActive("mq04")) L.refresh("mq04");
  }

  /** Remove an item from an actor's inventory whatever its representation. */
  function actorTake(actor, id) {
    if (!actor || !actor.inventory) return;
    const inv = actor.inventory;
    try {
      if (inv instanceof Map) inv.delete(id);
      else if (Array.isArray(inv)) {
        for (let i = inv.length - 1; i >= 0; i--)
          if ((Array.isArray(inv[i]) ? inv[i][0] : inv[i].id) === id)
            inv.splice(i, 1);
      } else if (typeof inv.remove === "function") inv.remove(id, 99);
      else if (typeof inv === "object") delete inv[id];
    } catch (e) {
      /* ignore */
    }
  }
  function kongGives(how) {
    L.setFlag("kong_resolution", how);
    actorTake(L.npc("esb_kong"), "q_knickerbocker_core");
    L.give("q_knickerbocker_core", 1);
  }

  // Continuity ceasefire around the UN while the player is a guest. This is a LOCAL
  // truce zone: only the UN garrison stands down — Continuity patrols elsewhere in the
  // city stay hostile (the global relation only changes when you actually sign on).
  // Act III: a sleeper who has not sided with the Covenant stays the Continuity's "guest" until he crosses (mq24),
  // per their standing orders ("We want him cooperative").
  const unGuest = () =>
    !L.flag("con_hostile") &&
    !L.flag("ending_played") &&
    (Q.isActive("mq04") ||
      faction() === "continuity" ||
      (faction() === "none" && Q.isStarted("mq04") && !Q.isComplete("mq24")));
  L.hook("init", function () {
    L.truceZone("un_guest", {
      faction: SH.conFaction,
      x: UN.x,
      z: UN.z,
      r: 220,
      cond: unGuest,
    });
  });
  L.hook("reset", function () {
    L.truceZone("un_guest", {
      faction: SH.conFaction,
      x: UN.x,
      z: UN.z,
      r: 220,
      cond: unGuest,
    });
  });
  L.trigger({
    id: "un_truce",
    x: UN.x,
    z: UN.z,
    r: 120,
    once: false,
    cooldown: 3,
    cond: unGuest,
    fire() {
      if (L.once("un_truce_bark"))
        L.say(
          "con_hale",
          "HOLD YOUR FIRE! That is the second sleeper. Nobody touches the second sleeper.",
        );
    },
  });

  // Refused Hale's offer: the ceasefire lasts only until you leave the plaza.
  L.trigger({
    id: "un_refused",
    once: true,
    cond: () =>
      !!L.flag("con_refused") &&
      !L.flag("con_hostile") &&
      faction() !== "continuity" &&
      L.dist(UN.x, UN.z) > 170,
    fire() {
      setConHostile();
      L.factionTruce(SH.conFaction, undefined, undefined, 0, true);
      L.notify(
        "The Continuity no longer considers you a guest of the federal government.",
      );
    },
  });

  // ------------------------------------------------------------------
  // World & NPCs
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const t1 = L.anchor(
      "rockefeller",
      ["terminal", "command", "cov_terminal"],
      { x: ROCK.x - 12, z: ROCK.z + 30 },
    );
    if (t1) L.spawnTerminal("cov_rock", t1, Math.PI);
    const t2 = L.anchor(
      "un_hq",
      ["terminal", "command", "continuity_terminal"],
      { x: UN.x - 22, z: UN.z + 12 },
    );
    if (t2) L.spawnTerminal("un_command", t2, -Math.PI / 2);
    const t3 = L.anchor(
      "empire_state",
      ["terminal", "observatory_terminal", "lobby_terminal"],
      { x: ESB.x + 18, z: ESB.z + 24 },
    );
    if (t3) L.spawnTerminal("esb_observatory", t3, 0);
    const t4 = L.anchor("nypl", ["terminal", "catalog", "desk"], {
      x: NYPL.x + 33,
      z: NYPL.z + 2,
    });
    if (t4) L.spawnTerminal("nypl_catalog", t4, -Math.PI / 2);
  });

