// play-inline-551 01 — flag
// Lines 13-361 of readable/play-inline-551.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const hero = () =>
    L.heroName ? L.heroName() : (G.HERO && G.HERO.name) || "Eli Wayte";
  const first = () => String(hero()).split(" ")[0];
  // Glowkeeper quest flags (45_): new 'glow_' names, or the 'atom_' names until that file converts.
  const glowFlag = (k) => L.flag("glow_" + k) || L.flag("atom_" + k);

  // ------------------------------------------------------------------
  // Locks (G.locks, guarded): the Stationmaster's teletype
  // ------------------------------------------------------------------
  const LOCK_GC = {
    id: "q_gc_stationmaster",
    label: "Stationmaster's Teletype",
    kind: "terminal",
    passcode: "JUNENINE",
    hint: "The Stationmaster used her birthday. The market guards all signed the card.",
    learnedFrom: ["Guard Kowalski / Guard Ng (Grand Central)"],
  };
  function learn(id) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id);
      } catch (e) {
        /* */
      }
    }
  }
  function registerLocks() {
    if (G.locks && G.locks.register) {
      try {
        G.locks.register(LOCK_GC);
      } catch (e) {
        /* */
      }
    }
  }

  // ------------------------------------------------------------------
  // Placement
  // ------------------------------------------------------------------
  const GC = { x: 240, z: -230 }; // concourse centre
  const RC = { x: 0, z: -340 }; // Radio City
  const gcSpot = (names, dx, dz) => ({
    site: "grand_central",
    anchors: names,
    fallback: { x: GC.x + dx, z: GC.z + dz },
  });
  const rcSpot = (names, dx, dz) => ({
    site: "radio_city",
    anchors: names,
    fallback: { x: RC.x + dx, z: RC.z + dz },
  });

  // Merchant stock presets: [item id, count]. Ids that don't resolve are skipped.
  const STOCK = {
    bar: [
      ["fizzo_cola", 8],
      ["prairie_root_beer", 5],
      ["purified_water", 6],
      ["beer", 6],
      ["whiskey", 3],
      ["shellback_meat", 2],
      ["golden_plain_jerky", 4],
      ["mama_marinara_meatballs", 2],
    ],
    doctor: [
      ["rally_tonic", 8],
      ["rally_tonic_extra", 2],
      ["prussian_blue", 4],
      ["iodine_tabs", 4],
      ["morphine_syrette", 2],
      ["purified_water", 4],
    ],
    guns: [
      ["pistol_32", 1],
      ["pistol_10mm", 1],
      ["hunting_rifle", 1],
      ["sawed_off_shotgun", 1],
      ["combat_knife", 1],
      ["baseball_bat", 1],
      ["frag_grenade", 4],
      ["ammo_32", 60],
      ["ammo_10mm", 80],
      ["ammo_308", 30],
      ["ammo_12ga", 30],
      ["ammo_556", 40],
      ["rally_tonic", 3],
      ["leather_armor", 1],
      ["metal_armor", 1],
    ],
    infobot: [
      ["fizzo_cola", 2],
      ["purified_water", 2],
    ],
    water: [
      ["purified_water", 14],
      ["dirty_water", 6],
      ["fizzo_cola", 3],
    ],
    junk: [
      ["scrap_metal", 8],
      ["tin_can", 10],
      ["dry_cell", 2],
      ["relay_board", 1],
      ["homeguard_cleanser", 2],
      ["duct_tape", 3],
      ["tuff_bond", 2],
    ],
  };

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
  L.hook("init", function () {
    L.quest({
      id: "mq02",
      main: true,
      category: "main",
      order: 2,
      act: 1,
      actLabel: "Act I: Thaw",
      name: "All Aboard",
      giver: "Zeke Marlow (tape reel) / Moe Kessler",
      location: "Grand Central Market",
      desc:
        "Zeke's tape reel says he thawed out three weeks ahead of you, walked up to Grand Central, and that anyone at the Oyster Bar " +
        "would know where he went next. Grand Central is on 42nd Street, a long walk north of the Civic Center. It is also the last place you saw Nicole: the Whispering Gallery, outside the Oyster Bar, on the night before you went under.",
      stages: [
        {
          id: "travel",
          text: "Travel to Grand Central Market.",
          markers: [
            {
              anchor: ["grand_central", ["entrance", "door", "main_entrance"]],
              fallback: { x: 240, z: -185 },
              label: "Grand Central Market",
            },
          ],
          onEnter() {
            L.hint(
              "radio",
              "Tip: Your VIGIL goggles pick up local stations (Tab → RADIO).",
              25,
            );
          },
        },
        {
          id: "gallery",
          text: "Stand in a corner of the Whispering Gallery, outside the Oyster Bar.",
          markers: [
            {
              anchor: [
                "grand_central",
                ["whispering_gallery", "oyster_bar", "bar"],
              ],
              fallback: { x: 222, z: -232 },
              label: "Whispering Gallery",
            },
          ],
        },
        {
          id: "ask",
          text: "Ask Moe Kessler about Zeke at the Oyster Bar.",
          markers: () => [{ npc: "gc_moe", label: "Moe Kessler" }],
        },
        {
          id: "infobot",
          text: "(Optional) Buy information about Zeke from the INFO-BOT.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            (Q.stage("mq02") === "ask" || Q.stage("mq02") === "gallery") &&
            !L.flag("infobot_zeke"),
          doneIf: () => !!L.flag("infobot_zeke"),
          markers: () => [{ npc: "gc_infobot", label: "INFO-BOT" }],
        },
        {
          id: "infobot_nicole",
          text: "(Optional) Ask the INFO-BOT about Nicole Mead (10 scrip).",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.reached("mq02", "gallery") || !!L.flag("ms_gallery_memory"),
          doneIf: () => !!L.flag("ms_knows_track61"),
          markers: () => [{ npc: "gc_infobot", label: "INFO-BOT" }],
        },
        {
          id: "watcher",
          text: "(Optional) Chase the robed watcher from Chambers Street.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("ms_watcher_shot") && !L.flag("ms_watcher_chased"),
          doneIf: () => !!L.flag("ms_saw_watcher"),
          failIf: () =>
            !!L.flag("ms_watcher_chased") && !L.flag("ms_saw_watcher"),
        },
        {
          id: "shooter",
          text: "(Optional) Look for the rooftop shooter on Chambers Street.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_watcher_shot"),
          doneIf: () => !!L.flag("ms_saw_shooter"),
        },
      ],
      rewards: { xp: 150 },
    });

    L.quest({
      id: "mq03",
      main: true,
      category: "main",
      order: 3,
      act: 1,
      actLabel: "Act I: Thaw",
      name: "Radio Free Manhattan",
      giver: 'Moe Kessler → "Rocky" Delgado',
      location: "Radio City Music Hall",
      desc:
        'Zeke went to see "Rocky" Delgado, the voice of Radio Free Manhattan, who keeps catching a coded government signal ' +
        "bouncing off the Statue of Liberty. Rocky broadcasts from Radio City Music Hall on Sixth Avenue — and every night at nine he reads the Missing Persons Hour.",
      stages: [
        {
          id: "rocky",
          text: 'Find "Rocky" Delgado at Radio City Music Hall.',
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "amp",
          text: "Find a Signal Amplifier for Rocky's transmitter (raiders in the Chrysler, Rosa at Grand Central, or fix it yourself).",
          markers: () => {
            const m = [];
            if (!L.flag("got_amp_chrysler") && L.pickups.amp)
              m.push(
                L.chryslerMarker
                  ? L.chryslerMarker(
                      L.pickups.amp.pos,
                      "Signal Amplifier (Chrysler crown)",
                    )
                  : {
                      x: L.pickups.amp.pos.x,
                      z: L.pickups.amp.pos.z,
                      label: "Signal Amplifier (Chrysler Building)",
                    },
              );
            if (!L.flag("rosa_sold_amp"))
              m.push({ npc: "gc_rosa", label: "Rosa Marquez (sells parts)" });
            return m;
          },
        },
        {
          id: "deliver",
          text: "Bring the Signal Amplifier to Rocky.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "notice",
          text: "Give Rocky a Missing Persons notice for Nicole.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "listen",
          text: "Listen to the intercepted transmission with Rocky.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
      ],
      rewards: { xp: 300, scrip: 50 },
      onComplete() {
        L.news(
          'This is "Rocky" Delgado, and Radio Free Manhattan is now coming at you LOUDER, CLEARER and FARTHER than ever, thanks to a certain sleeper with a screwdriver and twenty-two years of news to catch up on. ' +
            "And a notice, folks, on the Missing Persons Hour: Nicole Mead. Interpreter, Canadian, dark hair, laughs with her whole face. " +
            (L.flag("ms_notice") === "sundays"
              ? 'Message reads: "Nicole Mead — ' +
                first() +
                "'s awake. Whispering Gallery, Sundays.\" "
              : "Last seen at the UN, March '67. ") +
            "You know where to find us.",
        );
        L.hint(
          "radio2",
          "Tune in: goggles → RADIO → Radio Free Manhattan. Rocky will report on your deeds.",
          3,
        );
        // the next main quests start from the story spine (61_ms_core.js)
      },
    });
  });

  // Arrival at Grand Central
  L.trigger({
    id: "gc_arrive",
    x: GC.x,
    z: GC.z,
    r: 48,
    cond: () => Q.stage("mq02") === "travel",
    fire() {
      Q.setStage("mq02", L.flag("ms_gallery_memory") ? "ask" : "gallery");
      L.say(
        "gc_delphine",
        "New face! Welcome to Grand Central Market. Guns holstered, scrip handy, manners on.",
      );
      if (!G.isStub("music") && G.music.setMood)
        try {
          G.music.setMood("settlement");
        } catch (e) {
          /* */
        }
    },
  });
  // If the player reaches Grand Central before MQ02 even starts (explorers), still set things up.
  L.trigger({
    id: "gc_arrive_early",
    x: GC.x,
    z: GC.z,
    r: 48,
    cond: () => !Q.isStarted("mq02") && Q.isComplete("mq01"),
    fire() {
      Q.start("mq02", {
        stage: L.flag("ms_gallery_memory") ? "ask" : "gallery",
      });
    },
  });

  // ------------------------------------------------------------------
  // The Whispering Gallery: where he said goodbye to Nicole (memory card)
  // ------------------------------------------------------------------
  function galleryMemory() {
    if (L.flag("ms_gallery_memory")) return;
    L.setFlag("ms_gallery_memory");
    if (!L.has("ms_note_memory_gallery"))
      L.give("ms_note_memory_gallery", 1, true);
    L.notify(
      "You stand in the corner, face to the tiles, the way you stood on the 19th of February, 1967. Somebody at the far arch is laughing at something. For a second the arch carries it straight to you, and it is her laugh, and it isn't.",
      { duration: 9 },
    );
    L.later(9.5, () =>
      L.notify(
        'MEMORY ADDED: "The Whispering Gallery, 19 February 1967" (goggles → NOTES).',
        { duration: 5 },
      ),
    );
    L.xp(20, "The Whispering Gallery");
    if (Q.stage("mq02") === "gallery")
      L.later(1, () => Q.setStage("mq02", "ask"));
  }
