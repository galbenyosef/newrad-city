// play-inline-285 06 — poi
// Lines 1097-1432 of readable/play-inline-285.pretty.js (statement-aligned).
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    const inOrOut = (poi, name, label, ext, extLabel) => () =>
      P.inCell(poi)
        ? mk(poi, name, label)()
        : mk(poi, ext || "exterior_entrance", extLabel || label)();
    P.safe("quest:show", () =>
      q.define({
        id: "pt_show",
        name: "Curtain Call",
        giver: "Barnaby Thistlewood",
        location: "Lyceum Theatre",
        desc: 'The Lyceum Players — a company of actors who never left the theatre after the bombs — want to finally open "Our Glowing Town". Raiders at the Port Authority stole their only prompt book, and Act Three needs a real spotlight.',
        stages: [
          {
            id: "talk",
            text: "Speak with Barnaby Thistlewood at the Lyceum Theatre.",
            markers: inOrOut(
              "lyceum_theatre",
              "director",
              "Barnaby Thistlewood",
            ),
          },
          {
            id: "gather",
            text: () =>
              "Help the Lyceum Players open their play (" +
              [
                F.bookGiven || has("pt_prompt_book"),
                F.lightGiven || has("pt_es_klieg"),
              ].filter(Boolean).length +
              "/2).",
            markers: () =>
              has("pt_prompt_book") && has("pt_es_klieg")
                ? inOrOut("lyceum_theatre", "director", "Barnaby Thistlewood")()
                : [],
          },
          {
            id: "g_book",
            text: "Recover the Lyceum prompt book from the raiders at the Port Authority Bus Terminal.",
            sideObjective: true,
            doneIf: () => F.bookGiven || has("pt_prompt_book"),
            showIf: () => qStage("pt_show") === "gather",
            markers: () =>
              F.bookGiven || has("pt_prompt_book")
                ? []
                : inOrOut(
                    "port_authority",
                    "prompt_book",
                    "The Dispatcher's Office",
                  )(),
          },
          {
            id: "g_light",
            text: "Salvage a Klieg light from Studio 50 at the Ed Sullivan Theater.",
            sideObjective: true,
            doneIf: () => F.lightGiven || has("pt_es_klieg"),
            showIf: () => qStage("pt_show") === "gather",
            markers: () =>
              F.lightGiven || has("pt_es_klieg")
                ? []
                : inOrOut("ed_sullivan", "klieg", "Studio 50 Lighting Store")(),
          },
          {
            id: "g_return",
            text: "Bring what you found to Barnaby Thistlewood.",
            sideObjective: true,
            doneIf: () => F.bookGiven && F.lightGiven,
            showIf: () =>
              qStage("pt_show") === "gather" &&
              (has("pt_prompt_book") || has("pt_es_klieg")),
            markers: inOrOut(
              "lyceum_theatre",
              "director",
              "Barnaby Thistlewood",
            ),
          },
          {
            id: "showtime",
            text: 'Take the front-row seat in the Lyceum for the premiere of "Our Glowing Town".',
            markers: inOrOut("lyceum_theatre", "seat", "The Seat of Honour"),
          },
        ],
        rewards: {
          xp: 350,
          scrip: 150,
          items: [["pt_players_mask", 1]],
          standing: 10,
        },
      }),
    );
    P.safe("quest:deadair", () =>
      q.define({
        id: "pt_deadair",
        name: "Dead Air",
        giver: "Sid Mancuso's log",
        location: "Ed Sullivan Theater",
        desc: 'On March 5th, 1967, "The Tomorrow Hour" was pre-empted by the end of the world. Its master reel is still in Studio 50. The stage manager\'s last wish: that somebody would see it.',
        stages: [
          {
            id: "prep",
            text: () =>
              "Get Studio 50 back on the air (" +
              [F.power, F.broadcast || has("pt_es_master_reel")].filter(Boolean)
                .length +
              "/2).",
          },
          {
            id: "p_power",
            text: "Engage main power at the transmitter console in the basement.",
            sideObjective: true,
            doneIf: () => F.power,
            showIf: () => qStage("pt_deadair") === "prep",
            markers: () =>
              F.power
                ? []
                : inOrOut(
                    "ed_sullivan",
                    "transmitter",
                    "Transmitter Console",
                    "stage_door",
                    "Ed Sullivan Theater",
                  )(),
          },
          {
            id: "p_reel",
            text: 'Find the master reel of the last "Tomorrow Hour" (the producer\'s office).',
            sideObjective: true,
            doneIf: () => has("pt_es_master_reel") || F.broadcast,
            showIf: () => qStage("pt_deadair") === "prep",
            markers: () =>
              has("pt_es_master_reel")
                ? []
                : inOrOut("ed_sullivan", "producer_safe", "Producer's Safe")(),
          },
          {
            id: "broadcast",
            text: "Load the master reel at the control room terminal and put Studio 50 on the air.",
            markers: inOrOut("ed_sullivan", "control_terminal", "Control Room"),
          },
        ],
        rewards: { xp: 300, items: [["pt_host_tux", 1]] },
      }),
    );
    P.safe("quest:locker", () =>
      q.define({
        id: "pt_locker417",
        name: "Locker 417",
        giver: "A claim check",
        location: "Port Authority Bus Terminal",
        desc: "A claim check for coin locker 417, deposited on the morning the bombs fell. \"Key's at Lost & Found if I miss the 8:40. Don't wait for me.\"",
        stages: [
          {
            id: "key",
            text: "Find the key to locker 417 in the Lost & Found on the baggage level.",
            markers: () =>
              has("pt_key_locker417")
                ? mk("port_authority", "locker417", "Locker 417")()
                : inOrOut("port_authority", "lost_found", "Lost & Found")(),
          },
          {
            id: "open",
            text: "Open coin locker 417 in the Port Authority concourse.",
            markers: inOrOut("port_authority", "locker417", "Locker 417"),
          },
        ],
        rewards: { xp: 150 },
      }),
    );
  }

  // ==================================================================
  // NPCs (Lyceum Players)
  // ==================================================================
  const NPCS = [
    {
      id: "pt_barnaby",
      poi: "lyceum_theatre",
      at: "director",
      type: "human",
      name: "Barnaby Thistlewood",
      outfit: "merchant",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pt_barnaby",
      level: 6,
      barks: [
        "From the top!",
        "Projection, darlings, PROJECTION.",
        "Twenty-two years and still no understudy.",
      ],
    },
    {
      id: "pt_vivienne",
      poi: "lyceum_theatre",
      at: "npc1",
      type: "human",
      name: "Genevieve Laurent",
      outfit: "dj",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_pt_vivienne",
      level: 5,
      barks: [
        "Mama, look at the sky. It's GREEN.",
        "Line?",
        "Nobody ever looks. Nobody ever LOOKS.",
      ],
    },
    {
      id: "pt_player1",
      poi: "lyceum_theatre",
      at: "npc2",
      type: "human",
      name: "Lyceum Player",
      outfit: "settler",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pt_player",
      level: 4,
    },
    {
      id: "pt_player2",
      poi: "lyceum_theatre",
      at: "npc3",
      type: "human",
      name: "Lyceum Player",
      outfit: "drifter",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_pt_player",
      level: 4,
    },
    {
      id: "pt_tess",
      poi: "lyceum_theatre",
      at: "merchant",
      type: "human",
      name: "Tess Carraway",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pt_tess",
      level: 6,
      faction: "settlers",
      weapon: "pistol_10mm",
      merchant: {
        scrip: 450,
        table: "merchant_general",
        extra: [
          ["rally_tonic", 3],
          ["ammo_10mm", 60],
          ["ammo_32", 40],
          ["purified_water", 4],
          ["old_world_formalwear", 1],
          ["top_hat", 1],
          ["showgirl_costume", 1],
        ],
      },
    },
    {
      id: "pt_mortimer",
      poi: "lyceum_theatre",
      at: "bartender",
      type: "human",
      name: "Mortimer",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pt_mortimer",
      level: 6,
      merchant: {
        scrip: 250,
        table: "merchant_food",
        extra: [
          ["beer", 6],
          ["whiskey", 2],
          ["fizzo_cola", 5],
          ["purified_water", 3],
          ["prairie_root_beer", 3],
        ],
      },
    },
    {
      id: "pt_rosalind",
      poi: "lyceum_theatre",
      at: "doctor",
      type: "human",
      name: "Rosalind",
      outfit: "doctor",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pt_rosalind",
      level: 5,
      merchant: {
        scrip: 300,
        table: "merchant_doctor",
        extra: [
          ["rally_tonic", 4],
          ["prussian_blue", 2],
          ["iodine_tabs", 2],
          ["morphine_syrette", 1],
        ],
      },
    },
    {
      id: "pt_usher",
      poi: "lyceum_theatre",
      at: "usher",
      type: "patrolman",
      name: "Ticket-Taker",
      ai: "guard",
      dialogue: "dlg_pt_usher",
      level: 5,
      voice: "robot",
    },
    {
      id: "pt_horace",
      poi: "lyceum_theatre",
      at: "guard_ext",
      type: "human",
      name: "Horace",
      outfit: "leather_armor",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pt_horace",
      level: 7,
      weapon: "hunting_rifle",
    },
  ];
  C.NPCS = NPCS;
