// play-inline-552 02 — flag
// Lines 264-517 of readable/play-inline-552.pretty.js (statement-aligned).
  L.hook("register", function () {
    if (G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({}, LOCK_BELVEDERE));
      } catch (e) {
        /* */
      }
    }
    // Belvedere Castle weather station (the teletype itself is placed by the Central Park landmark interior).
    L.terminal("belvedere_weather", {
      title: "N.Y.C. PARKS DEPT. — BELVEDERE WEATHER STATION",
      header:
        "U.S. WEATHER BUREAU / NYC PARKS — AUTOMATED STATION BLV-1\nRECORDING SINCE 1919",
      lock: { id: LOCK_BELVEDERE.id, passcode: LOCK_BELVEDERE.passcode },
      entries: [
        {
          title: "Current Conditions",
          text: () =>
            "SKY: " +
            (L.flag("sky_clean")
              ? "CLEAR (!!) — station recalibrating, readings may be erroneous. Readings are not erroneous."
              : "OVERCAST / ASH PARTICULATE") +
            "\nAIRBORNE RADIOACTIVITY: " +
            (L.flag("sky_clean") ? "0.02 R/h" : "4.7 R/h (ELEVATED)") +
            "\nASH-STORM PROBABILITY (24H): " +
            (L.flag("sky_clean") ? "0%" : "38%"),
        },
        {
          title: "Station Log — March 5, 1967",
          text: "09:41  Barometric anomaly, north.\n09:42  Barometric anomaly, everywhere.\n09:43  Station switching to battery reserve.\n09:43  Station would like to note for the record that it predicted rain.",
        },
        {
          title: "Maintenance Note (Office of Civil Defense)",
          text: "By arrangement with the Office of Civil Defense, the Belvedere station shares a data line with a federal relay downtown. Do not unplug the grey cable. Do not ask about the grey cable.\n\n[The grey cable has been chewed through by something with a lot of teeth.]",
        },
        {
          title: "Observer Roster",
          text: "DAY OBSERVER: M. DORSEY (+ DOG, UNAUTHORISED)\nNIGHT OBSERVER: VACANT SINCE 03.05.1967\n\nREMINDER: The passcode is changed by Bureau memo only. Do not write it in your logbook, Dorsey.",
        },
      ],
    });

    L.dialogue("dlg_biscuit", {
      start: () => (L.flag("biscuit_recruited") ? "companion" : "wild"),
      nodes: {
        wild: {
          speaker: "Biscuit",
          text: () =>
            "[A wiry, mud-coloured mutt with one ear up and one ear permanently down stands over a skeleton in a rotted Parks Department overcoat. He bares his teeth — then looks at your face, and the growl wavers.]" +
            (L.flag("biscuit_fed_try") ? " [He is eyeing your pack.]" : ""),
          responses: [
            {
              text: "[Offer him some food.]",
              cond: () => !!foodInInventory(),
              next: "food",
            },
            {
              text: '"Biscuit, heel."',
              cond: () => L.has("q_note_biscuit_owner"),
              next: "heel",
            },
            {
              text: "[Kneel and hold out your hand.]",
              check: { attr: "presence", value: 6 },
              next: "hand",
              failNext: "hand_fail",
            },
            {
              text: "[Bury his master.]",
              cond: () => !L.flag("mack_buried"),
              next: "bury",
            },
            { text: "[Back away slowly.]" },
          ],
        },
        food: {
          text: () =>
            "[You hold out some " +
            (((G.items.get && G.items.get(foodInInventory())) || {}).name ||
              "food") +
            ". The dog considers the food, considers the skeleton, considers you... and eats it in one bite. His tail thumps the ground, once, twice.]",
          onEnter() {
            const f = foodInInventory();
            if (f) L.take(f, 1);
            L.setFlag("biscuit_fed");
          },
          responses: [
            { text: '"Come on, boy. Come with me."', next: "join" },
            { text: "[Leave him be.]" },
          ],
        },
        heel: {
          text: "[At the sound of the word his ears shoot up — both of them, briefly. He looks at the skeleton. He looks at you. He ignores the command completely, exactly as the letter promised... and then trots over and sits on your foot.]",
          onEnter() {
            L.xp(15, "Biscuit, heel");
          },
          responses: [{ text: '"Good boy. Let\'s go."', next: "join" }],
        },
        hand: {
          text: "[You kneel in the ash, palm open, and wait. It takes a long time. Eventually a cold nose presses into your hand, and the dog sighs — a long, tired, very human sigh.]",
          onEnter() {
            L.xp(15, "Presence");
          },
          responses: [
            {
              text: '"You\'ve been alone a long time, huh? Come on."',
              next: "join",
            },
          ],
        },
        hand_fail: {
          text: "[The dog snaps at the air a finger's width from your hand. Message received.]",
          onEnter() {
            L.setFlag("biscuit_fed_try");
          },
          responses: [{ text: "[Back away.]" }],
        },
        bury: {
          text: "[You scrape a shallow grave in the terrace garden with a broken tile and lay the old man in it. The dog watches every movement. When you are done, he lies down on the fresh earth for a minute... then gets up, shakes himself off, and looks at you as if to say: well?]",
          onEnter() {
            L.setFlag("mack_buried");
            L.standing(50, "Buried Mack");
            L.xp(25, "A proper burial");
            const s = L.world.mackSkel;
            if (s && s.remove) {
              try {
                s.remove();
              } catch (e) {
                /* */
              }
            }
          },
          responses: [
            { text: '"Come on, boy. He\'d want you to go."', next: "join" },
          ],
        },
        join: {
          text: "[The dog barks once — a real bark, not a warning — and falls in at your side. The tin tag on his collar reads BISCUIT.]",
          onEnter() {
            recruit(
              L.flag("mack_buried")
                ? "burial"
                : L.flag("biscuit_fed")
                  ? "food"
                  : "trust",
            );
          },
          responses: [{ text: '"Welcome aboard, Biscuit."' }],
        },
        companion: {
          speaker: "Biscuit",
          text: () =>
            L.flag("biscuit_waiting")
              ? "[Biscuit is waiting exactly where you left him, vibrating with the effort of staying.]"
              : "[Biscuit looks up at you, tongue out, ready for anything that involves you and possibly a burrow rat.]",
          responses: [
            {
              text: '"Stay here, boy."',
              cond: () => !L.flag("biscuit_waiting"),
              action: () => {
                const b = biscuit();
                L.setFlag(
                  "biscuit_waiting",
                  b ? { x: b.pos.x, y: b.pos.y, z: b.pos.z } : true,
                );
                if (b) {
                  try {
                    b.follow && b.follow(null);
                  } catch (e) {
                    /* */
                  }
                }
              },
            },
            {
              text: '"Biscuit, heel!"',
              cond: () => !!L.flag("biscuit_waiting"),
              action: () => {
                L.setFlag("biscuit_waiting", false);
                const b = biscuit();
                if (b) {
                  try {
                    b.follow && b.follow(G.player);
                  } catch (e) {
                    /* */
                  }
                }
                L.sfx("dog_bark");
              },
            },
            { text: "[Scratch behind his ears.]", next: "pet" },
            {
              text: '"Go home to Grand Central. Wait for me there."',
              action: () => {
                L.setFlag("biscuit_waiting", { x: 238, y: 0, z: -224 });
                const b = biscuit();
                if (b) {
                  try {
                    b.follow && b.follow(null);
                    b.moveTo && b.moveTo(238, -224);
                  } catch (e) {
                    /* */
                  }
                }
              },
            },
            { text: "[Leave.]" },
          ],
        },
        pet: {
          text: () =>
            [
              "[Biscuit leans his whole weight into your leg and groans with happiness.]",
              "[One ear goes up. The other one tries. It does not make it.]",
              "[He rolls over, exposing a belly with a burrow-rat scar on it. You are obligated. You scratch the belly.]",
            ][Math.floor(Math.random() * 3)],
          responses: [{ text: '"Good boy."' }],
        },
      },
    });
  });

  // Keep the follower re-attached after doors, ferries and fast travel.
  function regroup() {
    if (!L.flag("biscuit_recruited") || L.flag("biscuit_waiting")) return;
    const b = biscuit();
    if (!b || b.dead) return;
    L.later(0.15, () => {
      if (
        b.dead ||
        Math.hypot(b.pos.x - G.player.pos.x, b.pos.z - G.player.pos.z) < 20
      )
        return;
      try {
        const p = G.player.pos,
          s = L.freeSpot(p.x + 1.2, p.z + 1.2, p.y, { maxR: 4 });
        b.pos.set(s.x, s.y, s.z);
        if (b.follow) b.follow(G.player);
      } catch (e) {
        /* */
      }
    });
  }
  G.events.on("doorTransition", regroup);
  G.events.on("teleport", regroup);
  G.events.on("actorKilled", (a) => {
    if (a && a.id === DOG && L.flag("biscuit_recruited")) {
      L.setFlag("biscuit_dead");
      L.notify("Biscuit has died.");
      L.news(
        "Sad news tonight, folks. That good dog from Bethesda Terrace — Biscuit — didn't make it. Went down fighting next to his friend. Give your own mutt an extra scratch tonight. Rocky will be right back after this song.",
      );
    }
  });
