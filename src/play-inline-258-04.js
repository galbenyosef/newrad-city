// play-inline-258 04 — base
// Lines 837-1099 of readable/play-inline-258.pretty.js (statement-aligned).
  PF.item({
    id: "pbr_mb_cagekey",
    type: "key",
    name: "Ironjaw's Cage Key",
    weight: 0,
    value: 0,
    desc: "A padlock key on a string of human teeth. It smells exactly as bad as you think.",
  });
  PF.item({
    id: "pbr_note_menu",
    type: "note",
    name: 'Crumpled Paper: "LARDER"',
    title: "Scrawled in charcoal on a Civil Defense pamphlet",
    text: "LARDER\n\nSOFTLING — SKINNY ONE (TALKS TOO MUCH)\nSOFTLING — LOUD ONE (BITES)\nPACK OXEN — NONE (SAD)\nDOG — 1 (ESCAPED. BAD DOG.)\n\nIRONJAW SAYS: NO EAT SOFTLINGS TILL BIG DAY.\nWHEN BIG DAY?\nIRONJAW SAYS: WHEN IRONJAW SAYS.\n\n[Underneath, in a different, even worse hand:] ASK AGAIN TOMORROW",
  });
  PF.item({
    id: "pbr_reel_conductor",
    type: "tape",
    name: "Tape reel: D Train, Car 3",
    title: "NYCTA Operator Log — D Train, Manhattan Bridge, 03.05.1967",
    text: "[Train wheels screeching. A PA chime.]\n\nOPERATOR: Ladies and gentlemen, we are being held momentarily on the Manhattan Bridge because of — because of the sky. I have no further information about the sky.\n\n[Screaming, distant. A long rumble. The car lurches.]\n\nOPERATOR: The bridge is twisting. It always twists when the trains cross, folks, it's fine, it's been doing that since 1909— [a sound of tearing steel] —that is not the normal twist. Everyone to the rear car. Rear car! Hold the—\n\n[The recording is 11 minutes of wind and creaking steel. Then:]\n\nOPERATOR (quietly): Stand clear of the closing doors.\n\n[Recording ends.]",
  });
  PF.item({
    build() {
      const base = PF.live("items") ? G.items.get("fire_axe") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 40) * 1.25),
              critChance: (base.weapon.critChance || 1) * 1.3,
              condDecay: (base.weapon.condDecay || 0.003) * 0.5,
            })
          : undefined;
      return {
        id: "pbr_blue_steel",
        type: w ? "weapon" : "misc",
        name: "Blue Steel",
        weight: 9,
        value: 1400,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: "A fire axe whose head was ground out of a chunk of Manhattan Bridge rivet-plate, still wearing its 1909 blue paint, on a handle of subway rail. Ironjaw's pride. Hits like a train crossing the bridge.",
        weapon: w,
      };
    },
  });

  PF.terminal("pbr_mb_inspect", {
    title: "DEPT. OF PLANT & STRUCTURES",
    header:
      "CITY OF NEW YORK — DEPT. OF PLANT & STRUCTURES\nMANHATTAN BRIDGE — ANCHORAGE INSPECTION STATION M",
    entries: [
      {
        title: "Structure Summary",
        text: 'MANHATTAN BRIDGE — opened 31 Dec 1909. First suspension bridge to use deflection theory: a lighter, more flexible deck. Four main cables of 9,472 wires each, anchored in this anchorage by eyebar chains to grillages of steel embedded in 120,000 cubic yards of masonry.\n\nKnown issue: the subway tracks run on the OUTER edges of the deck. Every train makes the bridge twist. It has been "temporarily" reinforced 14 times since 1956.',
      },
      {
        title: "Inspection 03.02.1967",
        text: 'South cable housing: eyebar chains dry, no corrosion noted. Grillage: nominal.\nDeck: twist under two trains measured at 0.9°. Within tolerance (tolerance revised upward, again).\nCivil Defense shelter survey team visited. Asked whether the anchorage "could be sealed from inside". Told them it\'s a bridge anchorage, not a bomb shelter. They said "we\'ll see" and took photographs.',
      },
      {
        title: "Incident 03.05.1967",
        text: "09:47 — Southbound D train stopped at midspan. Cause: sky.\n09:48 — Twist sensors off scale.\n09:51 — Outer track, north side: train car derailed. Car 3 suspended over river.\n09:52 — [NO FURTHER ENTRIES]",
      },
      {
        title: "South Housing Access",
        text: 'Stair in the east hall climbs to the deck hatch in the south cable housing. Hatch opens from inside. Please do not store "personal items" in the chain chamber. This means you, Novak.',
      },
    ],
  });

  // --- dialogue: captives ---
  PF.dialogue("pbr_dlg_tomas_cage", {
    start: () => (PF.flag("mb_freed") ? "free" : "caged"),
    nodes: {
      caged: {
        speaker: "Tomas Ybarra",
        text: "Psst — hey! You're not grey and you're not nine feet tall, so you must be the rescue. Tomas Ybarra, Canal Street Wagon Company — president, treasurer, and current inventory. That's Minh, my partner. We're being kept for something the big one calls \"Big Day\". I don't want to find out what Big Day is. And listen — it's a combination padlock. I watched the big guy work the dial: oh-nine-oh-nine. Same as on his footlocker. He can't count higher.",
        learn: ["pbr_mb_cage", "pbr_mb_hoard"],
        onEnter() {
          PF.setFlag("mb_found", true);
          if (!PF.q.started("pbr_anchor")) PF.q.start("pbr_anchor");
          PF.q.advance("pbr_anchor", ["find"], "free");
        },
        responses: [
          { text: "How do I get you out?", next: "how" },
          {
            text: "Hold still. I'll try the dial.",
            cond: () => !PF.flag("mb_freed"),
            action: () => PF.mbOpenCage(),
            next: null,
          },
          { text: "Hang tight." },
        ],
      },
      how: {
        speaker: "Tomas Ybarra",
        text: "Ironjaw — the boss, the one with the metal teeth — keeps the key on a string around his neck. He sleeps in the pit down the north stairs. Or try the dial — oh-nine-oh-nine, like I said. Please hurry. The skinny one keeps measuring me.",
        onEnter() {
          PF.q.advance("pbr_anchor", ["find"], "free");
        },
        responses: [{ text: "I'll be back with the key." }],
      },
      free: {
        speaker: "Tomas Ybarra",
        text: "We're out! We're OUT! Minh, run! Friend, find me at the Bridgemarket under the Queensboro — I owe you a debt, and I'm told I'm very good for it.",
        responses: [{ text: "Go. Now." }],
      },
    },
  });
  PF.dialogue("pbr_dlg_minh_cage", {
    start: () => (PF.flag("mb_freed") ? "free" : "caged"),
    nodes: {
      caged: {
        speaker: "Minh Dao",
        text: "Don't listen to Tomas, he's been talking for three days straight. It's why they call him \"the skinny one who talks\". I'm \"the loud one who bites\". Get us out and I'll show you why.",
        responses: [{ text: "Working on it." }],
      },
      free: {
        speaker: "Minh Dao",
        text: "Thanks, stranger. If you see Ironjaw, bite him for me.",
        responses: [{ text: "Get moving." }],
      },
    },
  });
  PF.dialogue("pbr_dlg_tomas_market", {
    start: () => (PF.q.active("pbr_anchor") ? "thanks" : "trade"),
    nodes: {
      thanks: {
        speaker: "Tomas Ybarra",
        text: "There they are — the hero of the anchorage! Minh wants to name a pack oxen after you. I talked her down to a pack mule. Here — the company's emergency fund, and a standing discount. Canal Street Trade wagon Company never forgets a friend. We forget roads, dates, and occasionally Minh, but never a friend.",
        responses: [
          {
            text: "Glad you made it, Tomas.",
            action: () => finishAnchor(),
            next: "trade",
          },
        ],
      },
      trade: {
        speaker: "Tomas Ybarra",
        text: "Canal Street Trade wagon Company, back in business and only slightly chewed. What can I get you?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "How's Minh?", next: "minh" },
          { text: "See you, Tomas." },
        ],
      },
      minh: {
        speaker: "Tomas Ybarra",
        text: "Out on the Brooklyn run with a new rifle and a grudge. She says if she ever sees another Brute she'll bite it. I believe her.",
        responses: [{ text: "Ha.", next: "trade" }],
      },
    },
  });
  function finishAnchor() {
    if (!PF.q.active("pbr_anchor")) return;
    PF.q.done("pbr_anchor");
    PF.news(
      'The Canal Street Trade wagon Company is trading again out of the Bridgemarket. Tomas Ybarra says a stranger walked into a Brute larder under the Manhattan Bridge and walked out with him. "I was the larder," he adds, helpfully.',
    );
  }
  function freeCaptives() {
    if (PF.flag("mb_freed")) return;
    PF.setFlag("mb_freed", true);
    PF.sfx("door_open", PF.anchorOf(KEY, "pen"));
    G.notify("The cage doors swing open.");
    PF.xp(150, "Freed the Canal Street trade wagon");
    PF.standing(20, "Freed captives from a Brute larder");
    for (const id of ["pbr_mb_tomas", "pbr_mb_minh"]) {
      const a = PF.getNpc(id);
      if (a && !a.dead) {
        PF.safe(
          "bark",
          () =>
            a.say &&
            a.say(
              id === "pbr_mb_tomas"
                ? "Free! Bridgemarket — find me there!"
                : "Finally! Out of my way!",
            ),
        );
        const ent = PF.anchorOf(KEY, "entrance");
        if (ent && a.moveTo) PF.safe("flee", () => a.moveTo(ent.x, ent.z));
        setTimeout(() => {
          PF.safe("rm", () => {
            const b = PF.getNpc(id);
            if (b && G.actors.remove) G.actors.remove(b);
            delete PF.npcs[id];
          });
        }, 7000);
      }
    }
    if (!PF.q.started("pbr_anchor")) PF.q.start("pbr_anchor");
    PF.q.set("pbr_anchor", "report");
    // Tomas sets up shop at the Bridgemarket
    const def = PF.npcDefs.find((d) => d.id === "pbr_mb_tomas_market");
    if (def) PF.spawnNpc(def);
  }
  PF.mbOpenCage = function () {
    if (PF.flag("mb_freed")) return;
    if (!PF.locksLive() && PF.inv.count("pbr_mb_cagekey") <= 0) {
      PF.sfx("door_locked");
      G.notify("The padlock won't budge. Ironjaw has the key.");
      return;
    }
    PF.lockOpen(PF.LOCKS.mb_cage, freeCaptives);
  };

  PF.quest({
    id: "pbr_anchor",
    name: "Canned Goods",
    giver: 'Lou "Two-Tone" Mazur',
    location: "Manhattan Bridge",
    desc: "The Canal Street trade wagon — Tomas Ybarra and Minh Dao — vanished near the Manhattan Bridge. Lou at the Bridgemarket thinks the Brutes in the bridge anchorage are keeping people as food.",
    stages: [
      {
        id: "find",
        text: "Search the Manhattan Bridge anchorage for the missing trade wagon.",
        markers: () => [{ x: 276, z: 588.5, label: "Anchorage door" }],
      },
      {
        id: "free",
        text: "Free Tomas Ybarra and Minh Dao from the Brute larder.",
        markers: () => {
          const a = PF.anchorOf(KEY, "pen");
          return a
            ? [{ x: a.x, z: a.z, y: a.y, label: "The Pen", interior: KEY }]
            : [];
        },
      },
      {
        id: "key",
        text: "(Optional) Take the cage key from Ironjaw in the Anchor Pit.",
        optional: true,
        sideObjective: true,
        doneIf: () =>
          PF.inv.count("pbr_mb_cagekey") > 0 || !!PF.flag("mb_freed"),
        markers: () => {
          const a = PF.anchorOf(KEY, "boss");
          return a
            ? [{ x: a.x, z: a.z, y: a.y, label: "Ironjaw", interior: KEY }]
            : [];
        },
      },
      {
        id: "report",
        text: "Find Tomas Ybarra at the Bridgemarket.",
        markers: () => [{ npc: "pbr_mb_tomas_market", label: "Tomas Ybarra" }],
        // Tomas's market stall NPC is gated on mb_freed at newGame/load: make sure he is standing there
        // whenever this stage is entered (however the quest got here), so the hand-in always exists.
        onEnter() {
          const def = PF.npcDefs.find((d) => d.id === "pbr_mb_tomas_market");
          if (def) PF.spawnNpc(def);
        },
      },
    ],
    rewards: { xp: 400, scrip: 175, standing: 25 },
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
