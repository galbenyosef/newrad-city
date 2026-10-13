/* src/quests/35_park.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 35: CENTRAL PARK — BISCUIT THE DOG
 *   SQ "Who's a Good Boy?" — a loyal dog guards his dead owner at
 *   Bethesda Terrace. Earn his trust (food, the owner's own words, or
 *   burying his master) and he becomes your companion.
 *   + the Belvedere weather-station teletype (passcode in Mack Dorsey's
 *     observer's logbook, which lies beside his remains).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const SPOT = { x: 14, z: -548 }; // Bethesda Terrace, east side of the fountain plaza
  const DOG = "biscuit"; // npc id
  const LOCK_BELVEDERE = {
    id: "q_park_belvedere_station",
    label: "Belvedere Weather Station Teletype",
    passcode: "NIMBUS",
    kind: "terminal",
    hint: "Mack Dorsey kept the station passcode in his observer's logbook (beside his remains, Bethesda Terrace).",
    learnedFrom: ["Observer's logbook (Bethesda Terrace)"],
  };

  function biscuit() {
    return L.npc(DOG);
  }
  function learnLock(id, src) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id, src);
      } catch (e) {
        /* */
      }
    }
  }
  function foodInInventory() {
    if (G.isStub("inventory") || !G.inventory.list) return null;
    let list = [];
    try {
      list = G.inventory.list("aid") || [];
    } catch (e) {
      list = [];
    }
    const pref = [
      "golden_plain_jerky",
      "dog_chow",
      "pigeon_on_a_stick",
      "shellback_meat",
      "franks_and_beans",
      "chocolate_zeppelin",
      "mama_marinara_meatballs",
      "burrow_rat_meat",
      "salisbury_steak",
    ];
    for (const p of pref) {
      const e = list.find((x) => x.id === p && x.count > 0);
      if (e) return e.id;
    }
    const any = list.find(
      (x) =>
        x.def && x.def.tags && x.def.tags.indexOf("food") >= 0 && x.count > 0,
    );
    return any ? any.id : null;
  }
  function recruit(how) {
    if (L.flag("biscuit_recruited")) return;
    L.setFlag("biscuit_recruited");
    L.setFlag("biscuit_how", how);
    L.setFlag("biscuit_waiting", false);
    const b = biscuit();
    if (b) {
      b.faction = "player";
      try {
        if (b.setHostile) b.setHostile(false);
      } catch (e) {
        /* */
      }
      try {
        if (b.follow) b.follow(G.player);
      } catch (e) {
        G.reportError("quests:follow", e);
      }
    }
    L.sfx("dog_bark");
    L.notify("Biscuit has joined you.");
    Q.complete("sq_biscuit");
    L.news(
      "A little good news for the dog lovers out there. The pup who's been keeping vigil at Bethesda Terrace finally found a new friend: a fella in a frosty grey suit with an orange collar, of all things. Biscuit, buddy, if you're listening: you're a good boy. Everybody says so. Rocky says so.",
    );
  }
  L.biscuit = { recruit };

  L.hook("init", function () {
    L.defineItem({
      id: "q_note_mack_logbook",
      type: "note",
      name: "Observer's Logbook",
      weight: 0,
      value: 0,
      learn: LOCK_BELVEDERE.id,
      title: "N.Y.C. PARKS DEPT. — BELVEDERE STATION — OBSERVER M. DORSEY",
      text:
        "Mar 2 1967 — Wind NW 12. Barometer steady. Took the pup up the castle stairs; he barked at a pigeon for forty minutes. Pigeon won.\n\n" +
        "Mar 4 1967 — Station teletype passcode changed per Weather Bureau memo. New word is NIMBUS. (Old word was CUMULUS. Somebody at the Bureau thinks this is security.)\n\n" +
        "Mar 5 1967 — 09:40 Barometer doing something it is not allowed to do.\n\n" +
        "[Later entries, in pencil, shakier:]\n\nNobody has come to relieve me. The pup and I are living on the terrace. The castle is full of roaches the size of shoes. " +
        "If anybody ever reads the station tape: the sky has been the wrong colour for eleven years and I wrote it down every single day. That ought to count for something.",
    });

    L.quest({
      id: "sq_biscuit",
      name: "Who's a Good Boy?",
      giver: "Biscuit",
      location: "Bethesda Terrace, Central Park",
      desc: "A scruffy dog is guarding a skeleton at Bethesda Terrace, and snarling at anyone who comes too close.",
      stages: [
        {
          id: "meet",
          text: "Earn the trust of the dog at Bethesda Terrace.",
          markers: () => [{ npc: DOG, label: "Dog" }],
        },
        {
          id: "letter",
          text: "(Optional) Read the letter on the skeleton.",
          sideObjective: true,
          optional: true,
          showIf: () => !L.has("q_note_biscuit_owner"),
          markers: () =>
            L.pickups.biscuit_letter
              ? [
                  {
                    x: L.pickups.biscuit_letter.pos.x,
                    z: L.pickups.biscuit_letter.pos.z,
                    label: "Letter",
                  },
                ]
              : [],
        },
      ],
      rewards: { xp: 100 },
    });
  });

  L.trigger({
    id: "biscuit_meet",
    x: SPOT.x,
    z: SPOT.z,
    r: 26,
    cond: () =>
      !Q.isStarted("sq_biscuit") &&
      !L.flag("biscuit_recruited") &&
      !L.isDead(DOG),
    fire() {
      Q.start("sq_biscuit");
      L.later(0.5, () => {
        L.sfx("dog_bark", { pos: biscuit() ? biscuit().pos : undefined });
        L.say(DOG, "*low growl*");
      });
    },
  });

  // Biscuit killed (raiders, Maniacs, a stray grenade) before he trusted you: the quest can't be finished any more — close it.
  G.events.on("actorKilled", (a) => {
    if (a && a.id === DOG && Q.isActive("sq_biscuit")) Q.fail("sq_biscuit");
  });
  G.events.on("itemAdded", (id) => {
    if (id === "q_note_mack_logbook")
      learnLock(LOCK_BELVEDERE.id, "Observer's logbook");
  });

  L.hook("spawn", function () {
    const recruited = !!L.flag("biscuit_recruited");
    const waiting = L.flag("biscuit_waiting");
    let at;
    if (recruited && !waiting)
      at = {
        fallback: {
          x: G.player.pos.x + 1.5,
          z: G.player.pos.z + 1.5,
          y: G.player.pos.y,
        },
        maxR: 6,
      };
    else if (recruited && waiting && waiting.x !== undefined)
      at = { fallback: { x: waiting.x, z: waiting.z, y: waiting.y }, maxR: 6 };
    else
      at = {
        site: "bethesda",
        anchors: ["dog", "spawn1"],
        fallback: { x: SPOT.x, z: SPOT.z },
      };
    const b = L.spawnNPC({
      id: DOG,
      type: "dog",
      name: "Biscuit",
      faction: "player",
      ai: recruited && !waiting ? "follow" : "guard",
      level: 4,
      hp: 140,
      home: recruited ? undefined : "here",
      homeR: 3,
      at,
      dialogue: "dlg_biscuit",
      hostile: false,
      barks: recruited
        ? ["*wags*", "*sniffs the air*", "*happy bark*"]
        : ["*growl*", "*whine*"],
    });
    if (b && recruited && !waiting) {
      try {
        b.follow && b.follow(G.player);
      } catch (e) {
        /* */
      }
    }
    // Mack's remains, his letter, the dog tag and his observer's logbook
    // Beside where Biscuit keeps watch, on the SAME floor as him: the terrace is a raised plinth, and a street-level
    // search used to bury the letter (which the recruitment needs) inside it.
    const dogAt =
      !recruited && b && b.pos
        ? b.pos
        : L.anchor("bethesda", ["dog", "spawn1"], { x: SPOT.x, z: SPOT.z });
    const ref = {
      x: dogAt.x,
      z: dogAt.z,
      y: G.world.groundHeight(dogAt.x, dogAt.z, (dogAt.y || 0) + 0.6, 0.3),
    };
    let p = L.freeSpot(ref.x + 1.4, ref.z + 1.0, ref.y, { maxR: 5 });
    if (!p || p.forced)
      p = L.freeSpot(ref.x + 1.4, ref.z + 1.0, undefined, { maxR: 8 });
    if (!recruited || !L.flag("mack_buried")) {
      if (!L.flag("mack_buried"))
        L.world.mackSkel = L.dyn(
          L.prop("skeleton", {
            x: p.x,
            y: p.y,
            z: p.z,
            yaw: 0.8,
            pose: "lying",
          }),
        );
      L.pickup("biscuit_letter", "q_note_biscuit_owner", 1, {
        x: p.x + 0.5,
        y: p.y,
        z: p.z + 0.3,
      });
      L.pickup("biscuit_tag", "q_biscuit_tag", 1, {
        x: p.x - 0.4,
        y: p.y,
        z: p.z - 0.2,
      });
    }
    // The logbook stays (on the grave, once there is one) until it is picked up: it holds the station passcode.
    L.pickup("mack_logbook", "q_note_mack_logbook", 1, {
      x: p.x + 0.2,
      y: p.y,
      z: p.z - 0.6,
    });
  });

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
})();
