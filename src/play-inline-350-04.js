// play-inline-350 04 — the
// Lines 423-769 of readable/play-inline-350.pretty.js (statement-aligned).
  function dataMunicipal() {
    K.defineItem({
      id: "pc_mb_cage_key",
      type: "key",
      name: "Rusty Cage Key",
      weight: 0,
      value: 0,
      desc: 'Big Ledger kept it on a string with his "favourite" teeth. Opens the captive\'s cage in the Hall of Records.',
    });
    K.defineItem({
      id: "pc_mb_vault_key",
      type: "key",
      name: "Surrogate's Strongroom Key",
      weight: 0,
      value: 0,
      desc: 'A long brass key tagged "SURROGATE — STRONGROOM — DO NOT REMOVE FROM BUREAU". Somebody removed it from the bureau.',
    });
    K.defineItem({
      id: "pc_mb_key_city",
      type: "misc",
      name: "Key to the City",
      weight: 0.5,
      value: 500,
      desc: 'A gilded ceremonial key, a foot long, presented to "Distinguished Visitor [NAME TO BE ENGRAVED]". It opens nothing. It is worth a great deal to anyone who still believes in New York.',
    });
    K.defineItem(
      Object.assign(
        { id: "pc_mb_register", weight: 1, value: 0, quest: true },
        PC.REGISTER_DEF,
      ),
    );
    // uniques: the Surrogate's revolver (strongroom safe, code 4417) and Big Ledger's axe (boss drop)
    cloneWeapon(
      "pc_mb_eminent_domain",
      "magnum_44",
      {
        damage: 44,
        critMult: 1.8,
        critChance: 1.3,
        spread: 0.017,
        condDecay: 0.002,
        skin: "gold",
      },
      {
        name: "Eminent Domain",
        value: 1100,
        desc: 'An engraved nickel .44 from the Surrogate\'s safe, "presented to the Surrogate of New York County by a grateful Real Estate Board, 1961." It has taken more property than the city ever did.',
      },
    );
    cloneWeapon(
      "pc_mb_rubber_stamp",
      "fire_axe",
      { damage: 50, critMult: 1.5, condDecay: 0.001 },
      {
        name: "The Rubber Stamp",
        value: 2200,
        desc: 'Big Ledger\'s axe: a fire axe with a brass notary seal welded to the back of the head. Every blow leaves "APPROVED" backwards in whatever it hits.',
      },
    );
    K.defineItem({
      id: "pc_mb_stamp",
      type: "misc",
      name: "City Clerk's Seal",
      weight: 1,
      value: 120,
      desc: 'The embossing seal of the Office of the City Clerk. Tobias Wren gave it to you "so that SOMEONE in this city can make things official." Squeeze a paper and it says CITY OF NEW YORK in raised letters.',
    });
    const deadLedger = () => {
      try {
        const a =
          !G.isStub("actors") &&
          G.actors.get &&
          G.actors.get("pc_mb_bigledger");
        return !!(a && a.dead) || !!PC.flag("mb_bigledger_dead");
      } catch (e) {
        return false;
      }
    };
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pc_records",
        name: "Paper Trail",
        giver: "Tobias Wren",
        location: "Manhattan Municipal Building",
        desc: "Since the official books closed in March 1967, Tobias Wren, self-appointed Last Clerk of the City of New York, has kept a Register of every birth and death he could reach. The brutes who took the Hall of Records are burning it, page by page, to cook with. Wren is in a cage in the Hall, and his Register is beside their fire.",
        stages: [
          {
            id: "free",
            text: "Free Tobias Wren from the cage in the Hall of Records (Big Ledger keeps the key in his hoard by the throne of filing cabinets).",
            markers: [marker("municipal_building", "wren", "Captive's Cage")],
          },
          {
            id: "register",
            text: "Recover Wren's Register from beside Big Ledger's cook-fire in the Hall of Records, before it burns.",
            markers: [
              marker("municipal_building", "register_fire", "Wren's Register"),
            ],
          },
          // legacy stage id (saves from before the Register): migrated to 'register' / 'return' on load
          {
            id: "ledger",
            text: "Recover Wren's Register from beside Big Ledger's cook-fire in the Hall of Records.",
            hidden: true,
            markers: [
              marker("municipal_building", "register_fire", "Wren's Register"),
            ],
          },
          {
            id: "return",
            text: "Bring the Register to Tobias Wren.",
            markers: [{ npc: "pc_mb_wren", label: "Tobias Wren" }],
          },
          {
            id: "bigledger",
            sideObjective: true,
            text: "(Optional) Deal with Big Ledger.",
            doneIf: deadLedger,
          },
          {
            id: "deed",
            sideObjective: true,
            text: "(Optional) Recover the Deed Ledger from the Surrogate's Strongroom (Bureau of Vital Statistics, gallery level, east).",
            doneIf: () => K.has("pc_mb_ledger") || !!PC.flag("mb_deed_done"),
            markers: [
              marker(
                "municipal_building",
                "strongroom",
                "Surrogate's Strongroom",
              ),
            ],
          },
        ],
        rewards: { xp: 300, scrip: 60 },
      });
    }
    // contract: the quest may be started by the main story at any time; sync it to the world
    G.events.on("questStarted", (q) => {
      if (q && q.id === "pc_records") setTimeout(() => mb.sync(), 0);
    });
    G.events.on("loaded", () =>
      setTimeout(() => {
        if (K.q.active("pc_records")) mb.sync();
      }, 0),
    );
    G.events.on("itemAdded", (id) => {
      if (id === "pc_mb_register") {
        if (!K.q.started("pc_records") && PC.flag("mb_wren_free"))
          startRecords();
        mb.sync();
      }
    });
    G.events.on("actorKilled", (a) => {
      if (a && a.id === "pc_mb_bigledger")
        PC.setFlag("mb_bigledger_dead", true);
    });
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const deedOffer = () => K.has("pc_mb_ledger") && !PC.flag("mb_deed_done");
    G.dialogue.register("pc_dlg_wren", {
      start: () =>
        !PC.flag("mb_wren_free")
          ? PC.flag("mb_met_wren")
            ? "again"
            : "hello"
          : PC.flag("mb_register_back")
            ? deedOffer()
              ? "deed"
              : "after"
            : K.has("pc_mb_register")
              ? "register"
              : deedOffer()
                ? "deed"
                : "freed",
      nodes: {
        hello: {
          speaker: "Tobias Wren",
          onEnter: () => PC.setFlag("mb_met_wren", true),
          text: "Psst! Over here! In the — yes, the cage, thank you. Tobias Wren, Last Clerk of the City of New York. Self-appointed. Somebody had to. The big one, \"Big Ledger\" he calls himself, he can't read, is burning my Register to cook with. A page a meal. I tried to stop him. Now I'm on the menu for Tuesday.",
          responses: [
            {
              text: "I'll get you out.",
              next: "how",
              action: () => startRecords(),
            },
            { text: "What register?", next: "why" },
            { text: "Good luck with Tuesday.", end: true },
          ],
        },
        why: {
          speaker: "Tobias Wren",
          text: "When the official books closed in March of '67, I kept going. Every birth, every death I could reach: the Neon, the camps under Grand Central, the Battery, the river towns. Twenty-two years, in pencil, then in soot. When everyone who remembers is dead, the Register is all that says they were here. It's by the fire. He's working through it from the back.",
          responses: [
            {
              text: "All right. I'll get you out.",
              next: "how",
              action: () => startRecords(),
            },
            { text: "Not my problem.", end: true },
          ],
        },
        how: {
          speaker: "Tobias Wren",
          text: "Big Ledger keeps the cage key in his \"hoard,\" by that throne of filing cabinets at the north end. It's a cheap lock, but it's a MUNICIPAL lock: it only respects the proper key. And, quietly: the big one sleeps sitting up. He only looks awake.",
          responses: [{ text: "Sit tight.", end: true }],
        },
        again: {
          speaker: "Tobias Wren",
          text: "Still here. Still delicious, apparently. The key's in the hoard by the throne of filing cabinets. And the Register is by the fire. Please hurry. He had the 1978 deaths for breakfast.",
          responses: [
            { text: "Working on it.", end: true, action: () => startRecords() },
          ],
        },
        freed: {
          speaker: "Tobias Wren",
          text: "Free! My knees! My dignity, no, that's gone. Listen: the Register. Big Ledger keeps it on the paper pile beside his cook-fire, in the middle of the Hall. Bring it to my desk, here by the doors. I don't care what it costs him. Well. I care a little. Be careful.",
          responses: [
            { text: "I'll bring it.", end: true, action: () => startRecords() },
            { text: "Anything else up here worth saving?", next: "deedinfo" },
            { text: "Later.", end: true },
          ],
        },
        deedinfo: {
          speaker: "Tobias Wren",
          text: "The Deed Ledger, in the Surrogate's Strongroom, up the gallery stairs and east. The last volume before the bombs. The Registrar kept the strongroom key in her desk (the drawer combination is on file in the public index terminal on the gallery), the Bureau terminal can open the door too, and Big Ledger took a key off her. I would dearly like to read the last entry before it becomes kindling.",
          responses: [
            {
              text: "I'll keep an eye out.",
              end: true,
              action: () => startRecords(),
            },
          ],
        },
        register: {
          speaker: "Tobias Wren",
          text: "(He takes the Register in both arms, like a child pulled out of a river, and sits down on the floor with it.) ...He started at the back. The Grand Central pages, the Sixty-One Camp, under the Terminal. They're scorched and stuck together. I can lift them apart with a warm knife and a great deal of patience. Give me a little while.",
          responses: [
            {
              text: "Take all the time you need.",
              next: "register2",
              action: () => mb.registerBack(),
            },
          ],
        },
        register2: {
          speaker: "Tobias Wren",
          text: "Thank you. Truly. Here: twenty-two years of a clerk's pay, which is to say not much. If you are ever looking for someone, anyone, born or buried in this city since the bombs, come and ask me. That is what the book is for.",
          responses: [
            {
              text: "I found something else for you.",
              next: "deed",
              cond: deedOffer,
            },
            { text: "I'll be back.", end: true },
          ],
        },
        deed: {
          speaker: "Tobias Wren",
          text: '(He turns the Deed Ledger\'s pages with trembling reverence, then stops at the last entry and goes very quiet.) "Parcel 0001. Manhattan Island, all of it, sub-surface rights included. Transferred to the United States Office of Civil Defense, one dollar. Recorded the 4th of March, 1967. Purpose: classified." ...The day before the bombs. Washington bought the whole island for a dollar the day before it burned. Somebody knew.',
          responses: [
            { text: "It belongs with you. Keep it safe.", next: "deed_wren" },
            {
              text: "I'm keeping it. Someone should see this.",
              next: "deed_keep",
            },
            {
              text: "It's worth scrip to the right buyer. I'm selling it.",
              next: "deed_sell",
            },
          ],
        },
        deed_wren: {
          speaker: "Tobias Wren",
          text: "Legally the island belongs to the Office of Civil Defense, and I hear there are men on the radio who still think they ARE the government. As the Last Clerk I hereby rule that a deed signed by people who knew and said nothing is void for, for rudeness. There. It's official. Take this: the Clerk's seal, and my savings.",
          responses: [
            {
              text: "Glad to help.",
              next: "after",
              action: () => mb.deed("wren"),
            },
          ],
        },
        deed_keep: {
          speaker: "Tobias Wren",
          text: "You... want to keep it? Well. Show it to someone who ought to be ashamed of it. Just don't burn it. Promise me you won't burn it.",
          responses: [
            {
              text: "I promise.",
              next: "after",
              action: () => mb.deed("kept"),
            },
          ],
        },
        deed_sell: {
          speaker: "Tobias Wren",
          text: "(He looks at you over his glasses for a long moment.) It's yours to sell. You took it out of the strongroom. I only hope whoever buys it reads the last page before they use it to light a stove.",
          responses: [
            {
              text: "Business is business.",
              next: "after",
              action: () => mb.deed("sold"),
            },
          ],
        },
        after: {
          speaker: "Tobias Wren",
          text: () =>
            PC.flag("mb_bigledger_dead")
              ? "I've started a new page. First entry: \"Big Ledger, deceased. Good riddance.\" Second entry: you. Come back any time. If you're looking for someone, I keep the book."
              : "I keep my desk by the barricade now, where I can hear him snore. If you're looking for anyone, born or buried in this city since the bombs, I keep the book.",
          responses: [{ text: "Goodbye, Tobias.", end: true }],
        },
      },
    });
  }
  function spawnMunicipalExt(ctx) {
    // The doorman guards the Hall of Records from the inside of the barricade (not the arch): the street outside the
    // Municipal Building is the first thing a sleeper from Sub-basement C-9 sees, and it must not open with a brute.
    const h = ctx.anchors.hall;
    if (!h) return;
    PC.spawnActor(ctx, {
      id: "pc_mb_doorman",
      type: "brute",
      name: "Brute Doorman",
      faction: "brutes",
      level: 7,
      hostile: true,
      pos: { x: h.x + 2.5, y: h.y, z: h.z + 4.5 },
      yaw: Math.PI,
      ai: "guard",
      home: "here",
      homeR: 4,
      loot: "brute",
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      barks: [
        "You got papers? NO? GOOD.",
        "Building closed. Forever.",
        "Take a number, puny human.",
      ],
    });
  }
  PC.part("municipal_building", {
    data: dataMunicipal,
    spawn: spawnMunicipalExt,
  });

  // ==================================================================
  // OLD ST. PATRICK'S — "The Bell of St. Patrick"
  // ==================================================================
