// play-inline-550 04 — the
// Lines 895-1183 of readable/play-inline-550.pretty.js (statement-aligned).
  L.hook("spawn", function () {
    computeSpots();
    if (
      Q.isActive("mq01") &&
      (Q.stage("mq01") === "roaches" || L.flag("trig_cryo_roach_nest"))
    )
      spawnRoaches();
    // Story doors: once open, open (the map / locks modules save their own state; this re-asserts it).
    if (L.flag("cryo_blast_open") || Q.isComplete("mq01")) {
      if (locksLive() && G.locks.unlock)
        safeCall("unlock", () => G.locks.unlock(LOCK_ID));
      if (
        mapLive() &&
        typeof G.map.openBlastDoor === "function" &&
        !(G.map.isBlastDoorOpen && G.map.isBlastDoorOpen())
      )
        safeCall("openBlastDoor", () =>
          G.map.openBlastDoor(true, { sound: false }),
        );
    }
    if (spawnGen === L.gen) return;
    spawnGen = L.gen; // session-local guard: props and pickups are placed once per new game / load
    // The goggles on their charging cradle.
    if (!L.flag("got_goggles") && C.goggles)
      L.pickup("cryo_goggles", L.gogglesId(), 1, {
        x: C.goggles.x,
        y: C.goggles.y,
        z: C.goggles.z,
      });
    // Director Calloway's desk note (the code).
    if (C.desk && !L.has("q_note_director_memo"))
      L.pickup("cryo_desk_note", "q_note_director_memo", 1, {
        x: C.desk.x,
        y: C.desk.y,
        z: C.desk.z,
      });
    // Security locker: the sidearm and its ammunition.
    if (!L.flag("got_service_pistol") && C.securityLocker) {
      const pistol = pistolId(),
        ammo = L.item("ammo_10mm");
      const items = [];
      if (pistol) items.push([pistol, 1]);
      if (ammo) items.push([ammo, 36]);
      const h = items.length
        ? L.dyn(
            L.prop("locker", {
              x: C.securityLocker.x,
              y: C.securityLocker.y,
              z: C.securityLocker.z,
              yaw: faceTo(C.securityLocker, C.start),
              items,
              name: "Security Locker",
              owner: null,
              id: "q_cryo_security_locker",
              persistent: false,
              noSave: false,
            }),
          )
        : null;
      if (pistol && (!h || (!h.container && !h.interactable))) {
        L.pickup("cryo_pistol", pistol, 1, {
          x: C.securityLocker.x,
          y: (C.securityLocker.y || 0) + 0.9,
          z: C.securityLocker.z,
        });
        if (ammo)
          L.pickup("cryo_ammo", ammo, 36, {
            x: C.securityLocker.x + 0.3,
            y: (C.securityLocker.y || 0) + 0.9,
            z: C.securityLocker.z,
          });
      }
    }
    // Locker 7: the hero's own effects (Nicole's photo strip and letters; the ring box is his choice).
    if (!L.flag("ms_locker7_emptied") && C.locker7) {
      const items = [];
      if (!L.has("ms_note_photo_strip") && !L.flag("ms_photo_taken"))
        items.push(["ms_note_photo_strip", 1]);
      if (!L.has("ms_note_nicole_letters"))
        items.push(["ms_note_nicole_letters", 1]);
      if (!L.flag("ms_has_ring")) items.push(["ms_grandmother_ring", 1]);
      if (items.length) {
        const h = L.dyn(
          L.prop("locker", {
            x: C.locker7.x,
            y: C.locker7.y,
            z: C.locker7.z,
            yaw: faceTo(C.locker7, C.start),
            items,
            name: "Locker 7 (yours)",
            owner: null,
            id: "q_locker7",
            persistent: false,
            noSave: false,
          }),
        );
        if (!h || (!h.container && !h.interactable)) {
          L.pickup("locker7_photo", "ms_note_photo_strip", 1, {
            x: C.locker7.x,
            y: (C.locker7.y || 0) + 0.9,
            z: C.locker7.z,
          });
          L.pickup("locker7_letters", "ms_note_nicole_letters", 1, {
            x: C.locker7.x + 0.3,
            y: (C.locker7.y || 0) + 0.9,
            z: C.locker7.z,
          });
          L.pickup("locker7_ring", "ms_grandmother_ring", 1, {
            x: C.locker7.x - 0.3,
            y: (C.locker7.y || 0) + 0.9,
            z: C.locker7.z,
          });
        }
      }
    }
    // The service door: twenty-two candle stubs on the outer step, seen through the wired-glass panel.
    if (C.exit && G.world.addInteractable) {
      const it = G.world.addInteractable({
        pos: L.V3(C.exit.x, (C.exit.y || 0) + 1.3, C.exit.z),
        radius: 1.2,
        label: "Service door (glass panel)",
        verb: "Look through",
        onInteract() {
          L.notify(
            "Through the wired glass you can see the outer step. Twenty-two candle stubs stand in a row along it, melted into each other like a little staircase of wax, oldest at the bottom. The newest is barely burned down. It cannot be more than a few weeks old.",
            { duration: 9 },
          );
          if (!L.flag("ms_candles_seen")) {
            L.setFlag("ms_candles_seen");
            L.xp(10, "Twenty-two candles");
          }
        },
      });
      L.dyn({ interactable: it });
    }
    // Zeke's locker: the tape reel and the Liberty Key.
    if (!L.flag("zeke_locker_looted") && C.zekeLocker) {
      const items = [
        ["q_reel_zeke", 1],
        ["q_liberty_key", 1],
      ];
      const stim = L.item("rally_tonic");
      if (stim) items.push([stim, 1]);
      const h = L.dyn(
        L.prop("locker", {
          x: C.zekeLocker.x,
          y: C.zekeLocker.y,
          z: C.zekeLocker.z,
          yaw: faceTo(C.zekeLocker, C.start),
          items,
          name: "Zeke's Locker (9)",
          owner: null,
          // stable id → rpg restores a half-emptied locker from the save instead of re-rolling it
          id: "q_zeke_locker",
          persistent: false,
          noSave: false,
        }),
      );
      if (!h || (!h.container && !h.interactable)) {
        L.pickup("zeke_reel", "q_reel_zeke", 1, {
          x: C.zekeLocker.x,
          y: (C.zekeLocker.y || 0) + 0.9,
          z: C.zekeLocker.z,
        });
        L.pickup("liberty_key", "q_liberty_key", 1, {
          x: C.zekeLocker.x + 0.35,
          y: (C.zekeLocker.y || 0) + 0.9,
          z: C.zekeLocker.z,
        });
      }
    }
    // Zeke's empty pod (examine).
    if (C.zekePod && G.world.addInteractable) {
      const it = G.world.addInteractable({
        pos: L.V3(C.zekePod.x, (C.zekePod.y || 0) + 1.2, C.zekePod.z),
        radius: 0.9,
        label: "Pod 9 (Marlow)",
        verb: "Examine",
        onInteract() {
          L.notify(
            'POD 9 — MARLOW, E. Z. — THAW FAULT — OCCUPANT DISCHARGED. The glass is propped open with a wrench. A Coney Island postcard is taped inside the lid: "Back soon. Don\'t touch my tools."',
            { duration: 7 },
          );
          if (!L.flag("cryo_zeke_pod_seen")) {
            L.setFlag("cryo_zeke_pod_seen");
            L.xp(5, "Pod 9");
          }
        },
      });
      L.dyn({ interactable: it });
    }
  });

  // ------------------------------------------------------------------
  // New game: the thaw
  // ------------------------------------------------------------------
  L.hook("newGame", function (opts) {
    opts = opts || {};
    if (opts.cheatSkipStart) {
      // Straight to the street: write MQ01 as already finished (no "QUEST ADDED" /
      // "COMPLETED" banners for a quest the player never saw) and hand over MQ02 at
      // once, so the tracker has an objective from the very first frame.
      L.setFlag("left_cryo");
      L.setFlag("cryo_blast_open");
      L.setFlag("cryo_code_known");
      if (locksLive() && G.locks.unlock)
        safeCall("unlock", () => G.locks.unlock(LOCK_ID));
      catchUpGear(true);
      L.completeSilently("mq01", ORDER);
      Q.start("mq02");
      return;
    }
    Q.start("mq01");
    // test modes (smoke / shot / survey) and skipIntro starts: no wake-up wash, no timed lines
    if (opts.skipIntro || G.SMOKE || G.SHOT || G.SURVEY) return;
    // Waking up: frost on the eyes, fading.
    L.overlay("#eef6ff", 0, 1.4, 4.2, 1);
    L.later(1.6, () =>
      custodian(
        "THAW CYCLE COMPLETE. POD 7 OCCUPANT: VITAL SIGNS ACCEPTABLE. GOOD MORNING, " +
          HERO() +
          ".",
      ),
    );
    L.later(7.4, () =>
      custodian(
        "THE DATE IS— [CALENDAR FAULT]. PLEASE COLLECT YOUR VIGIL GOGGLES FROM THE PREP ROOM CRADLE. THEY WILL EXPLAIN. THIS UNIT CANNOT.",
        6.5,
      ),
    );
    L.later(4.6, () =>
      L.hint(
        "move",
        "[W][A][S][D] move · [Mouse] look · [E] use · [Space] jump · [Shift] sprint",
      ),
    );
    L.later(5.5, () => {
      if (!G.isStub("music") && G.music.setMood)
        try {
          G.music.setMood("cryo");
        } catch (e) {
          /* */
        }
    });
  });

  /** Core cheat "skip the start" (and newGame {cheatSkipStart}): jump MQ01 to its end. */
  function skipStart() {
    if (L.flag("left_cryo")) return;
    L.setFlag("left_cryo");
    L.setFlag("cryo_blast_open");
    L.setFlag("cryo_code_known");
    if (locksLive() && G.locks.unlock)
      safeCall("unlock", () => G.locks.unlock(LOCK_ID));
    catchUpGear(true);
    if (Q.isActive("mq01")) {
      // Fill the log with the skipped steps so the completed quest reads properly.
      const s = L.STATE.get("mq01");
      if (s) {
        s.log = ORDER.slice();
        s.stage = "leave";
      }
      Q.complete("mq01");
    }
    // No 4.5 s gap with an empty tracker: the next objective is handed over now.
    if (!Q.isStarted("mq02")) Q.start("mq02");
  }
  L.hook("loaded", function () {
    if (Q.isComplete("mq01") || L.flag("left_cryo")) L.setFlag("got_goggles");
    // A save from before this quest was rewritten: move it onto the first step not yet done.
    if (Q.isActive("mq01") && ORDER.indexOf(Q.stage("mq01")) < 0) {
      const s = L.STATE.get("mq01"),
        next = firstUnmet(0);
      if (s) {
        s.stage = next;
        s.log = ORDER.slice(0, ORDER.indexOf(next) + 1);
      }
    }
  });
  G.events.on("cheatSkipStart", () => {
    safeCall("skipStart", skipStart);
  });

  // ------------------------------------------------------------------
  // Progress detection
  // ------------------------------------------------------------------
  G.events.on("actorKilled", (a) => {
    safeCall("roach", () => onRoachKilled(a));
  });
