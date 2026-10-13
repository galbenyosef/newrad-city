// play-inline-234 04 — responses
// Lines 955-1295 of readable/play-inline-234.pretty.js (statement-aligned).
  LI.addBuilder(KEY, 60, function () {
    LI.fl = build();
  });

  // ======================================================================
  // Gameplay: The Wedge (rent a room), Stitch & Rivet, Tubes, the Post Master's
  // quest "Dry Spell" (find the water runner — he is in The Exchange's Pit)
  // ======================================================================
  const QID = "li_fl_dryspell";
  LI.readyFns.push(function () {
    const C = LI.fl;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_skidoo_badge",
        type: "apparel",
        slot: "eyes",
        name: "23 Skidoo Club Pin",
        weight: 0,
        value: 150,
        attrs: { reflex: 1 },
        skills: { stealth: 5 },
        mesh: "token",
        unique: true,
        tags: ["apparel", "unique"],
        desc: 'An enamel pin shaped like a gust of wind: "23 SKIDOO — FLATIRON CORNER". Worn, it puts a spring in your step and an urge to leave before the police arrive.',
      },
      {
        id: "li_note_skidoo",
        type: "note",
        name: 'Photograph: "Flatiron Corner, 1905"',
        title: "A framed photograph, back inscription",
        text: "The wind comes round the prow of this building like a train. In 1905 men would stand on the corner of 23rd Street to watch it lift the ladies' skirts, and the police would move them along — \"Twenty-three skidoo!\"\n\nIn 1989 the wind still comes round the prow. Now it lifts the roof tarps and the Post Master's temper. The 23 Skidoo Club meets on the roof on Fridays to watch it. Nobody is quite sure why.",
      },
      {
        id: "li_note_wedge_ledger",
        type: "note",
        name: "The Wedge — Guest Ledger",
        title: "THE WEDGE — GUESTS",
        learn: LI.LOCKS.fl_ledger_term.id,
        text: 'ROOM 21 — convoy guard, 3 nights, paid in scrip.\nROOM 22 — [vacant — ask Mavis]\nROOM 23 — "Mr. Smith". It is always Mr. Smith.\nROOM 24 — Tubes\'s cousin, 1 night, still here after 40.\nROOM 25 — do not rent. Do not ask. — D.K.\n\nP.S. Lorena — your ledger word is SKIDOO. You asked me to write it down somewhere safe. This is somewhere. — D.K.',
      },
      {
        id: "li_wedge_key",
        type: "key",
        name: "Room Key — The Wedge, No. 22",
        desc: "A brass key on a wooden wedge-shaped fob. Room 22: a real bed, a door that locks, and a window with most of its glass.",
      },
    ]);
    LI.terminal("li_fl_ledger", {
      title: "FLATIRON TRADING POST — LEDGER",
      header:
        "FULLER BUILDING — OFFICE OF THE POST MASTER\nSCRIP IN / SCRIP OUT",
      lock: {
        id: LI.LOCKS.fl_ledger_term.id,
        passcode: LI.LOCKS.fl_ledger_term.passcode,
      },
      entries: [
        {
          title: "This Week",
          text: "IN: 1,204 scrip (stall rents, room rents, Hattie's cut, Gus's cut, Gus's other cut)\nOUT: 311 scrip (guards), 90 scrip (water), 0 scrip (roof repairs — tarps are free if you steal them)\nWATER: running short. Nate is 3 days late.",
        },
        {
          title: "The Building",
          text: "Built 1902 as the Fuller Building. Twenty-two storeys of limestone and terracotta on a steel frame on a triangle of land nobody else wanted. The locals said the wind would knock it down. It is still here. So are we.",
        },
        {
          title: "Security",
          text: 'No guns drawn inside the Post. The Exchange\'s raiders have been "auditing" carts on Broad Street. If Nate went that way, God help him — nobody else will.',
        },
        Object.assign(
          { title: "The Safe" },
          LI.codeText(
            "fl_post_safe",
            "Post Master's safe: same as the year this building went up, 1-9-0-2. If you are reading this and you are not me, put it back. — L.H.",
          ),
        ),
      ],
    });
    LI.dialogue("dlg_li_dottie", {
      start: () => "first",
      nodes: {
        first: {
          speaker: "Mavis Wojcik",
          text: () =>
            Q.flag("li_fl_room")
              ? "Back, hon? Room 22's yours. I changed the sheet. Well. I turned it over."
              : "Welcome to The Wedge, hon — best hotel in a triangle anywhere. Twenty scrip a night gets you a bed, a door that locks and no questions. Thirty gets you questions.",
          responses: [
            {
              text: "I'll take a room. (20 scrip)",
              cond: () => !Q.flag("li_fl_room") && LI.scrip() >= 20,
              action: () => {
                LI.giveScrip(-20);
                LI.give("li_wedge_key", 1);
                Q.set("li_fl_room");
                LI.unlockRoom();
              },
              next: "room",
            },
            { text: "What have you got to drink?", barter: true },
            { text: "Why is it called The Wedge?", next: "why" },
            { text: "Goodbye." },
          ],
        },
        room: {
          speaker: "Mavis Wojcik",
          text: "Room 22, down the hall on the left. Sleep as long as you like. If you hear knocking from 25, no you didn't.",
          responses: [{ text: "Thanks, Mavis." }],
        },
        why: {
          speaker: "Mavis Wojcik",
          text: "Look at the building, hon. Every room's a slice of pie. My room at the point is so narrow I sleep with my feet out the window.",
          responses: [{ text: "Ha. Goodbye." }],
        },
      },
    });
    LI.dialogue("dlg_li_marisol", {
      start: () => "first",
      nodes: {
        first: {
          speaker: "Marisol Vega",
          text: "Stitch and Rivet. I sew what's torn and rivet what's dented. Leather, metal, old-world suits for the rich folk from Grand Central. What do you need?",
          responses: [
            { text: "Show me your stock.", barter: true },
            { text: "Goodbye." },
          ],
        },
      },
    });
    LI.dialogue("dlg_li_sparks", {
      start: () => "first",
      nodes: {
        first: {
          speaker: 'Horace "Tubes" Adeyemi',
          text: "Mind the tubes! Everything in here hums or bites, sometimes both. I buy vacuum tubes, sell lantern batteries, and fix anything that ever had a plug. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Where do you get batteries?", next: "cells" },
            { text: "Goodbye." },
          ],
        },
        cells: {
          speaker: 'Horace "Tubes" Adeyemi',
          text: 'Recharge the dead ones off the Post generator. The Iron Covenant up at Rockefeller would call it "unauthorised technology". I call it Tuesday.',
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Goodbye." },
          ],
        },
      },
    });
    LI.dialogue("dlg_li_lorena", {
      start: () => {
        if (Q.done(QID)) return "after";
        if (Q.active(QID) && Q.flag("li_nyse_freed")) return "back";
        if (Q.active(QID)) return "waiting";
        return Q.flag("li_nyse_freed") ? "already" : "first";
      },
      nodes: {
        first: {
          speaker: "Lorena Hightower",
          text: "This is the prow office, and I'm the Post Master. You can see Fifth Avenue out of one window and Broadway out of the other, which is also how I run this place: one eye on each. What brings you up the stairs?",
          responses: [
            { text: "Anything you need done?", next: "job" },
            { text: "Just looking around." },
          ],
        },
        job: {
          speaker: "Lorena Hightower",
          text: "Nate Oduya runs our water cart down from the Battery. He's three days late, and the last anyone saw, he was taking the Broad Street shortcut — past the Stock Exchange. The raiders there call themselves The Exchange. Find him. If he's alive, bring him home. If he isn't... I'd still like to know.",
          responses: [
            { text: "I'll find him.", action: () => Q.start(QID) },
            { text: "Not right now." },
          ],
        },
        waiting: {
          speaker: "Lorena Hightower",
          text: "Any word on Nate? Broad Street. The Stock Exchange. Be careful in there.",
          responses: [{ text: "Still looking." }],
        },
        back: {
          speaker: "Lorena Hightower",
          text: 'He walked in an hour ago, half-starved and talking about a "pit" and forty-to-one odds. [She exhales.] You got him out. The Post owes you — and the Post pays its debts. Water on the house for as long as I\'m Post Master.',
          onEnter() {
            Q.complete(QID);
            LI.giveScrip(150);
            LI.give("purified_water", 5);
          },
          responses: [{ text: "Glad he's home.", next: "books" }],
        },
        books: {
          speaker: "Lorena Hightower",
          text: "And you're in the books now. Ledger terminal's on the desk behind me — the word is SKIDOO. Don't tell Gus.",
          onEnter() {
            LI.learnCode(LI.LOCKS.fl_ledger_term.id, "Lorena Hightower");
          },
          responses: [{ text: "Your secret's safe." }],
        },
        already: {
          speaker: "Lorena Hightower",
          text: "You're the one who pulled Nate out of that raider pit. [She shakes your hand hard.] Anything you need at the Post, you ask me first.",
          onEnter() {
            if (!Q.started(QID)) {
              Q.start(QID);
              Q.complete(QID);
              LI.give("purified_water", 5);
            }
          },
          responses: [{ text: "Thanks.", next: "books" }],
        },
        after: {
          speaker: "Lorena Hightower",
          text: "One eye on Fifth, one eye on Broadway. What can I do for you?",
          responses: [{ text: "Nothing today." }],
        },
      },
    });
    Q.define({
      id: QID,
      name: "Dry Spell",
      giver: "Lorena Hightower",
      location: "Flatiron Trading Post",
      desc: "The Flatiron Trading Post's water runner, Nate Oduya, is three days late. He was last seen taking the Broad Street shortcut past the Stock Exchange.",
      stages: [
        {
          id: "find",
          text: 'Find Nate Oduya. He was last seen near the Stock Exchange ("The Exchange", Wall Street).',
          markers: () =>
            LI.nyse
              ? [
                  {
                    x: LI.nyse.O.x + 20,
                    z: LI.nyse.O.z - 2.2,
                    label: "Nate Oduya?",
                    interior: true,
                  },
                ]
              : [{ x: 0, z: 828, label: "The Exchange" }],
        },
        // Nate freed (NYSE cage) → report back; Lorena's 'back' node completes the quest
        {
          id: "return",
          text: "Nate Oduya is out of the Pit. Tell Lorena Hightower at the Flatiron Trading Post.",
          markers: [{ npc: "li_fl_lorena", label: "Lorena Hightower" }],
        },
      ],
      rewards: { xp: 150 },
    });
    // unlock room 22 (Mavis) — the bed inside is then the player's to sleep in
    LI.unlockRoom = () => {
      const R = C.roomLock;
      if (!R.col) return;
      try {
        G.world.removeCollider(R.col);
      } catch (e) {
        /* */
      }
      R.col = null;
      R.mesh.rotation.y = 1.4;
      R.mesh.position.set(-12.7, 1.15, 2.5);
    };
    LI.saveHooks.fl = {
      save: () => ({ room: !C.roomLock.col }),
      load(d) {
        if (d && d.room) LI.unlockRoom();
      },
      reset() {
        const R = C.roomLock;
        if (!R.col) {
          R.col = C.col(-12.35, 0, 2.45, -12.05, 2.3, 3.55, {
            walkable: false,
          });
          R.mesh.rotation.y = 0;
          R.mesh.position.set(-12.2, 1.15, 3);
        }
      },
    };
    LI.interact(
      C.W(-12.2, 1.2, 3),
      "Room 22",
      () => (C.roomLock.col ? "Open" : "Open"),
      () => {
        if (!C.roomLock.col) return;
        if (LI.has("li_wedge_key")) {
          LI.openLock(LI.LOCKS.fl_room22, LI.unlockRoom);
          return;
        }
        LI.sfx("door_locked");
        LI.notify("Room 22 is locked. Mavis at the reception rents it out.");
      },
      {
        enabled: () => !!C.roomLock.col,
        locked: () => (C.roomLock.col ? "Rent from Mavis" : null),
      },
    );
    if (C.radSource) {
      try {
        G.world.addRadSource({
          x: C.O.x + C.radSource.x,
          y: C.radSource.y,
          z: C.O.z + C.radSource.z,
          radius: C.radSource.radius,
          strength: C.radSource.strength,
        });
      } catch (e) {
        /* */
      }
    }
  });
  const STOCK_DOTTIE = [
    ["beer", 6],
    ["whiskey", 2],
    ["purified_water", 6],
    ["fizzo_cola", 4],
    ["prairie_root_beer", 3],
    ["ox_steak", 2],
    ["cinnamon_bun", 2],
  ];
  const STOCK_MARISOL = [
    ["leather_armor", 1],
    ["leather_armor_reinforced", 1],
    ["metal_armor", 1],
    ["metal_helmet", 1],
    ["biker_leathers", 1],
    ["old_world_businesswear", 1],
    ["old_world_spring_dress", 1],
    ["fedora", 1],
    ["newsboy_cap", 1],
    ["bandana", 2],
  ];
  const STOCK_SPARKS = [
    ["ammo_dry_cell", 16],
    ["ammo_rivet", 30],
    ["riot_gas_grenade", 1],
    ["vacuum_tube", 3],
    ["scrap_electronics", 4],
    ["dry_cell", 2],
    ["relay_board", 1],
    ["radio", 0],
  ].filter((e) => e[1] > 0);
