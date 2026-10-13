// play-inline-552 01 — pos
// Lines 11-263 of readable/play-inline-552.pretty.js (statement-aligned).
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

