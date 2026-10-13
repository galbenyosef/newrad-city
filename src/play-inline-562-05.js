// play-inline-562 05 — qid
// Lines 1432-1705 of readable/play-inline-562.pretty.js (statement-aligned).
  L.hook("world", function () {
    const sp = spots();
    if (locksLive() && G.locks.register) {
      safeCall("register", () =>
        G.locks.register(Object.assign({}, LOCK_DROP)),
      );
      safeCall("register", () =>
        G.locks.register(Object.assign({}, LOCK_RELAY)),
      );
      if (G.locks.learnableFrom) {
        safeCall("learnableFrom", () =>
          G.locks.learnableFrom(
            LOCK_DROP.id,
            "Coded message from the Chambers Street phone booth (q_bs_note_coded); Mademoiselle Lys (dlg_bs_lys)",
          ),
        );
        safeCall("learnableFrom", () =>
          G.locks.learnableFrom(
            LOCK_RELAY.id,
            "Corbeau's letter in the Washington Square dead drop (q_bs_corbeau_letter); Mademoiselle Lys (dlg_bs_lys)",
          ),
        );
      }
      if (G.locks.obtainableFrom) {
        safeCall("obtainableFrom", () =>
          G.locks.obtainableFrom(
            "q_bs_note_coded",
            "The ringing phone booth on Chambers Street (after Long Winter)",
          ),
        );
        safeCall("obtainableFrom", () =>
          G.locks.obtainableFrom(
            "q_bs_corbeau_letter",
            "The Washington Square dead drop",
          ),
        );
      }
    }
    const V3 = L.V3;
    // The phone booth on Chambers Street, a few steps from the Municipal Building arch.
    if (sp.booth) {
      L.prop("phone_booth", {
        x: sp.booth.x,
        y: sp.booth.y,
        z: sp.booth.z,
        yaw: faceTo(sp.booth, sp.exit),
        container: false,
        persistent: true,
        id: "q_bs_phone_booth",
      });
      G.world.addInteractable({
        pos: V3(sp.booth.x, (sp.booth.y || 0) + 1.2, sp.booth.z),
        radius: 1.2,
        label: () => (phoneLive() ? "Ringing Phone Booth" : "Phone Booth"),
        verb: () => (phoneLive() ? "Answer" : "Lift Receiver"),
        enabled: () => mq01Done(),
        onInteract: () => safeCall("phone", answerPhone),
      });
    }
    // The dead drop by the Washington Square arch.
    if (sp.drop) {
      L.prop("mailbox", {
        x: sp.drop.x,
        y: sp.drop.y,
        z: sp.drop.z,
        yaw: faceTo(sp.drop, sp.arch),
        container: false,
        persistent: true,
        id: "q_bs_dead_drop_box",
      });
      G.world.addInteractable({
        pos: V3(sp.drop.x, (sp.drop.y || 0) + 1.0, sp.drop.z),
        radius: 1.0,
        label: () =>
          L.flag("bs_drop_open")
            ? "Rusted Mailbox (empty)"
            : "Rusted Mailbox (combination lock)",
        verb: () => (L.flag("bs_drop_open") ? "Search" : "Open"),
        locked: () =>
          !L.flag("bs_drop_open") &&
          locksLive() &&
          G.locks.isOpen &&
          !G.locks.isOpen(LOCK_DROP.id)
            ? "Locked"
            : null,
        onInteract: () => safeCall("drop", openDrop),
      });
    }
    // The Continuity signals cabinet (a field teletype) at Lexington & 47th.
    if (sp.relay) {
      safeCall("term", () =>
        L.spawnTerminal(
          "bs_relay",
          sp.relay,
          faceTo(sp.relay, { x: 280, z: -275 }),
        ),
      );
      // Without a terminals module the cabinet still prints its log (completability).
      if (G.isStub("terminals")) {
        const report = () => canExpose() && Q.stage(QID) === "choice";
        G.world.addInteractable({
          pos: V3(sp.relay.x, (sp.relay.y || 0) + 1.2, sp.relay.z),
          radius: 0.9,
          label: () =>
            report()
              ? "Signals Cabinet LX-47 (report the Bureau)"
              : "Signals Cabinet LX-47",
          verb: () => (report() ? "Transmit" : "Read"),
          onInteract() {
            if (report()) {
              L.notify(reportBureau());
              return;
            }
            readRelay();
            L.notify(
              "The cabinet's teletype has been printing the Bureau's radio traffic, decoded, for years. There is an order to round them up on the first night of frost.",
              { duration: 7 },
            );
          },
        });
      }
    }
  });

  // ------------------------------------------------------------------
  // Session spawns (new game / load)
  // ------------------------------------------------------------------
  L.hook("spawn", function () {
    spots();
    spawnLys();
    if (Q.isActive(QID) && Q.stage(QID) === "passage") spawnCorbeau();
    if (Q.isActive(QID) && Q.stage(QID) === "expose") spawnInspector();
    if (Q.isActive(QID) && Q.stage(QID) === "expose") relayTruce();
  });

  // A dead telephone rings on Chambers Street once the hero is out of the cryo unit.
  L.trigger({
    id: "bs_phone_ring",
    r: 16,
    pos: () => spots().booth || null,
    cond: () => phoneLive() && !L.inInterior(),
    fire() {
      L.notify(
        "Somewhere close, a telephone is ringing. Every telephone line in the city has been dead since 1967.",
        { duration: 6 },
      );
    },
  });

  // Pickups / items arriving by any route (pickup, container, debug).
  G.events.on("itemAdded", (id) => {
    safeCall("itemAdded", () => {
      if (id === "q_bs_note_coded") {
        L.setFlag("bs_got_note");
        learnDrop("The coded message");
        ensureStarted();
      } else if (id === "q_bs_corbeau_letter") {
        learnRelay("Corbeau's letter");
      }
    });
  });
  G.events.on("lockOpened", (id) => {
    if (id === LOCK_DROP.id && !L.flag("bs_drop_open"))
      safeCall("lockOpened", dropOpened);
  });

  // Lys walks to the pier (out of sight) once the hero has agreed to help them leave.
  let pollT = 0;
  L.hook("update", function (dt, realDt) {
    pollT -= realDt;
    if (pollT > 0) return;
    pollT = 1;
    if (!Q.isActive(QID)) return;
    const st = Q.stage(QID);
    if (st === "passage") {
      const sp = spots(),
        a = L.npc("bs_lys");
      if (
        a &&
        !a.dead &&
        sp.lysPier &&
        Math.hypot(a.pos.x - sp.lysPier.x, a.pos.z - sp.lysPier.z) > 8 &&
        L.dist(a.pos.x, a.pos.z) > 35 &&
        L.dist(sp.lysPier.x, sp.lysPier.z) > 35
      )
        L.moveNPC("bs_lys", sp.lysPier);
      if (!L.npc("bs_corbeau")) spawnCorbeau();
    } else if (
      st === "expose" &&
      !L.npc("bs_inspector") &&
      !L.hasPending("bs_inspector")
    ) {
      L.later(1, spawnInspector, "bs_inspector");
    }
  });

  // ------------------------------------------------------------------
  // Debug: G.quests.debug.spies(step)
  //   'start' | 'drop' | 'relay' | 'choice' | 'expose' | 'expose_done' | 'leave' | 'leave_done' | 'sell' (alias 'sell_done')
  // ------------------------------------------------------------------
  G.quests.debug.spies = function (step) {
    step = step || "start";
    const ensureStarted = () => {
      if (!Q.isStarted(QID)) Q.start(QID);
      advance();
    }; // debug: ignores the mq15 gate
    const toChoice = () => {
      ensureStarted();
      L.setFlag("bs_met_lys");
      learnDrop("debug");
      if (!L.flag("bs_drop_open")) {
        if (locksLive() && G.locks.unlock)
          safeCall("debug", () => G.locks.unlock(LOCK_DROP.id));
        dropOpened();
      }
      learnRelay("debug");
      readRelay();
      advance();
    };
    switch (step) {
      case "start":
        ensureStarted();
        break;
      case "drop":
        ensureStarted();
        L.setFlag("bs_met_lys");
        learnDrop("debug");
        advance();
        break;
      case "relay":
        ensureStarted();
        L.setFlag("bs_met_lys");
        learnDrop("debug");
        if (locksLive() && G.locks.unlock)
          safeCall("debug", () => G.locks.unlock(LOCK_DROP.id));
        dropOpened();
        advance();
        break;
      case "choice":
        toChoice();
        break;
      case "expose":
        toChoice();
        reportBureau();
        break;
      case "expose_done":
        toChoice();
        if (Q.stage(QID) !== "expose") reportBureau();
        outcomeExposed(L.has("q_bs_microfilm"));
        break;
      case "leave":
        toChoice();
        if (Q.stage(QID) === "choice") Q.setStage(QID, "passage");
        break;
      case "leave_done":
        toChoice();
        if (Q.stage(QID) === "choice") Q.setStage(QID, "passage");
        outcomeLeft("debug");
        break;
      case "sell":
      case "sell_done":
        toChoice();
        outcomeSold(300);
        break;
      default:
        break;
    }
    return {
      stage: Q.stage(QID),
      status: Q.get(QID) && Q.get(QID).status,
      outcome: outcome(),
      spots: S,
    };
  };
