// play-inline-550 05 — the
// Lines 1184-1356 of readable/play-inline-550.pretty.js (statement-aligned).
  G.events.on("itemAdded", (id) => {
    safeCall("itemAdded", () => {
      if (
        (id === "vigil_goggles" || id === "q_vigil_goggles") &&
        !L.flag("got_goggles")
      ) {
        L.giveGoggles(true);
        L.sfx("goggles_open");
        L.later(0.6, () =>
          L.notify("VIGIL goggles acquired.", {
            sub: "Press [Tab] to open them.",
            icon: "goggles",
          }),
        );
        L.hint(
          "goggles",
          "Press [Tab] to open your VIGIL goggles: status, items, quests, map, notes and radio.",
          2.5,
        );
        advance();
        return;
      }
      if (id === "q_note_director_memo") {
        readLogs("Director Calloway's desk note");
        return;
      }
      if (id === "ms_note_photo_strip" || id === "ms_note_nicole_letters") {
        if (id === "ms_note_photo_strip") L.setFlag("ms_photo_taken");
        if (!L.flag("ms_locker7_opened")) {
          L.setFlag("ms_locker7_opened");
          L.xp(10, "Locker 7");
          L.later(1, () =>
            L.notify(
              "Nicole. The photo strip from New Year's, her letters in green ink. Twenty-two years ago this was last week.",
              { duration: 6 },
            ),
          );
        }
        advance();
        return;
      }
      if (id === "ms_grandmother_ring") {
        if (!L.flag("ms_has_ring")) {
          L.setFlag("ms_has_ring");
          if (L.ms && L.ms.token) L.ms.token("ring");
          L.notify(
            "The ring box fits in your palm exactly the way it did in 1967.",
            { duration: 5 },
          );
        }
        return;
      }
      const pistol = pistolId();
      if (pistol && id === pistol && !L.flag("got_service_pistol")) {
        L.setFlag("got_service_pistol");
        if (!G.isStub("inventory") && G.inventory.equip)
          safeCall("equip", () => G.inventory.equip(pistol, { silent: true }));
        advance();
        return;
      }
      if (
        (id === "q_liberty_key" || id === "q_reel_zeke") &&
        !L.flag("left_cryo")
      ) {
        L.setFlag("zeke_locker_looted");
        advance();
      }
    });
  });
  G.events.on("blastDoor", (state) => {
    if (state === "opening" || state === "open")
      safeCall("blastDoor", onBlastOpen);
  });
  G.events.on("lockOpened", (id) => {
    if (id !== LOCK_ID) return;
    // The map opens its own door on a successful keypad entry; without one, MQ01 opens it.
    if (!(mapLive() && typeof G.map.openBlastDoor === "function"))
      safeCall("lockOpened", onBlastOpen);
  });

  // Polling: the blast door's state (in case its event was missed) and leaving the cryo unit.
  let pollT = 0;
  L.hook("update", function (dt, realDt) {
    pollT -= realDt;
    if (pollT > 0) return;
    pollT = 0.25;
    if (Q.isActive("mq01") && !L.flag("cryo_blast_open") && blastOpen())
      onBlastOpen();
    const p = G.player.pos;
    const outside = p.x < G.LAYOUT.INTERIOR_X_MIN;
    if (!outside || L.flag("left_cryo")) return;
    if (!Q.isStarted("mq01")) return;
    L.setFlag("left_cryo");
    catchUpGear();
    if (Q.isActive("mq01")) Q.complete("mq01");
    // Only play the "first daylight" cinematic when actually stepping out of the Municipal Building
    const X = G.LAYOUT.cryoExit;
    if (!G.SHOT && !G.SMOKE && X && Math.hypot(p.x - X.x, p.z - X.z) < 60)
      exitCinematic();
  });

  /** If the player skipped steps (walked straight out), give them what the story needs. */
  function catchUpGear(quiet) {
    let gave = false;
    if (!L.flag("got_goggles")) L.giveGoggles(true);
    // Nicole's photo strip and letters are the story's thread (the letters carry her return address).
    if (!L.has("ms_note_nicole_letters"))
      L.give("ms_note_nicole_letters", 1, true);
    if (!L.has("ms_note_photo_strip") && !L.flag("ms_photo_taken")) {
      L.give("ms_note_photo_strip", 1, true);
      L.setFlag("ms_photo_taken");
    }
    L.setFlag("ms_locker7_opened");
    if (!L.has("q_liberty_key")) {
      L.give("q_liberty_key", 1, true);
      if (!L.has("q_reel_zeke")) L.give("q_reel_zeke", 1, true);
      gave = true;
    }
    if (!L.flag("got_service_pistol")) {
      L.setFlag("got_service_pistol");
      const pistol = pistolId();
      if (pistol && !L.has(pistol)) L.give(pistol, 1, true);
      L.give(["ammo_10mm"], 24, true);
    }
    if (gave && !quiet)
      L.notify(
        "On the stair you find Zeke's reel and the Liberty Key in your suit pocket. He must have put them there while you slept.",
      );
  }

  // ------------------------------------------------------------------
  // "First daylight" exit cinematic (eyes adjusting, pan up Broadway to Midtown)
  // ------------------------------------------------------------------
  function exitCinematic() {
    const P = G.player;
    // Eyes adjusting to real daylight after twenty-two years: a white wash that fades…
    L.overlay("#fffbe8", 0, 0.15, 3.2, 1);
    // …while the camera drifts from the sky down to the Midtown skyline (driven by
    // the quest update loop, so it pauses with the game and dies with a reset).
    const y0 = P.yaw,
      p0 = 0.55;
    const tx = 80 - P.pos.x,
      tz = -72 - P.pos.z; // look north, toward the Empire State
    const y1 = Math.atan2(-tx, -tz);
    L.cinematic(5.2, (e) => {
      P.yaw = y0 + G.util.wrapAngle(y1 - y0) * e;
      P.pitch = p0 * (1 - e) + 0.06 * e;
    });
    L.sfx("wind_gust", { volume: 0.7 });
    L.later(1.2, () =>
      L.notify("Daylight. Real daylight, twenty-two years of it, all at once."),
    );
    L.later(6.0, () =>
      L.hint(
        "map",
        "[M] opens the map · [J] opens your quests · the tracker in the corner points to your objective.",
      ),
    );
    if (!G.isStub("music") && G.music.setMood)
      try {
        G.music.setMood("explore");
      } catch (e) {
        /* */
      }
  }

  // Debug helpers: G.quests.debug.blastDoor() — jump to the door stage with the code known.
  G.quests.debug.blastDoor = () => {
    if (Q.isActive("mq01")) Q.setStage("mq01", "door");
    learnCode("debug");
    return C;
  };
  G.quests.debug.cryoSpots = () => C;
