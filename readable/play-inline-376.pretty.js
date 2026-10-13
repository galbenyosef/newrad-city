/* src/poi_midtown3/80_content_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 3 · 80 content (interiors)
 * Items, notes & tape reels, terminals, quests, named bosses and the two
 * set pieces of the wave-3 midtown POIs. All writing original.
 *
 *  QUESTS
 *   m3_cellar    "Behind the Brick" ('52' Club) — the Jockeys have torn
 *                the club apart looking for Jack & Charlie's legendary
 *                Prohibition wine cellar. Find the hole in the basement
 *                wall, open the two-ton door with a meat skewer from the
 *                kitchen rack, claim the Mayor's Reserve, leave by the
 *                bootleggers' sidewalk hatch.
 *   m3_dead_air  "Red Eye" (New York Central Building) — Continuity Relay 7 in the
 *                gilded crown repeats the Continuity's broadcasts across
 *                Midtown and spots for their patrols. Fight up to the
 *                crown and overload the core — or re-tune it (Voss's relay
 *                code card, or its passcode) so it carries Radio Free Manhattan.
 *  LOCKS (P.LOCKS; every unlock is placed in this module)
 *   m3_king_safe       code 1105      the King's ledger teletype ("52" office)
 *   m3_officer_safe    code 0712      Voss's teletype (New York Central Building, 3rd floor)
 *   m3_armory_locker   code 3197      the Detachment 7 duty log tape reel
 *   m3_helms_officer   passcode GILDEDCROWN  the barracks teletype watch bill
 *   m3_helms_relay     passcode REDEYE, or the key card m3_relay_codes (Voss carries it; the card teaches the word)
 *   m3_cellar_wall     key m3_meat_skewer  (the kitchen rack) — the brick door's pin-hole latch
 *  SET PIECES
 *   the swinging brick door · the relay core (spinning coils, beacon on
 *   the mast: red = Continuity, dark = dead, green = Radio Free Manhattan).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._m3) return;
  const P = G._m3;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];

  // ------------------------------------------------------------------
  // locks (read by the site builders in init)
  // ------------------------------------------------------------------
  P.LOCKS = {
    king_safe: {
      id: "m3_king_safe",
      label: "The King's Safe",
      kind: "safe",
      code: "1105",
      hint: 'The King\'s ledger teletype in the "52" office.',
    },
    officer_safe: {
      id: "m3_officer_safe",
      label: "Officer's Safe",
      kind: "safe",
      code: "0712",
      hint: "Lieutenant Voss's teletype, New York Central Building, 3rd floor.",
    },
    armory_locker: {
      id: "m3_armory_locker",
      label: "Armory Locker",
      kind: "container",
      code: "3197",
      hint: "The Detachment 7 duty log tape reel.",
    },
    officer_term: {
      id: "m3_helms_officer",
      label: "Lt. A. Voss — Teletype",
      kind: "terminal",
      passcode: "GILDEDCROWN",
      hint: "The watch bill on the barracks teletype.",
    },
    relay_term: {
      id: "m3_helms_relay",
      label: "Relay 7 — Carrier Control",
      kind: "terminal",
      passcode: "REDEYE",
      key: "m3_relay_codes",
      hint: "Lieutenant Voss carries the relay code card.",
      keyFrom: "NPC: Lieutenant Voss (Helmsley crown)",
    },
    locker_vanderhoof: {
      id: "m3_locker_vanderhoof",
      label: "Private Locker — Mrs. Vanderhoof",
      kind: "container",
      code: "1931",
      hint: "The sommelier's cellar-book tape reel.",
    },
    locker_bradberton: {
      id: "m3_locker_bradberton",
      label: "Private Locker — J.-C. Bradberton",
      kind: "container",
      code: "4422",
      hint: "The sommelier's cellar-book tape reel.",
    },
    cellar_wall: {
      id: "m3_cellar_wall",
      label: "Brick Wall (pin-hole latch)",
      kind: "door",
      key: "m3_meat_skewer",
      hint: 'A meat skewer from the "52" kitchen rack.',
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);
  P.tick = P.tick || [];

  // ------------------------------------------------------------------
  // persistent state (G.save 'poi_midtown3' → content)
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    holeFound: false,
    cellarOpen: false,
    reserveTaken: false,
    relay: "on",
    vossDead: false,
    kingNamed: false,
    extraDead: [],
  });
  let F = DEF_STATE();
  C.F = () => F;
  P.saveHooks.content = {
    save: () => Object.assign({}, F),
    load: (d) => {
      F = Object.assign(DEF_STATE(), d || {});
      applyWorldState();
    },
  };

  // ------------------------------------------------------------------
  // safe wrappers
  // ------------------------------------------------------------------
  const has = (id, n) => {
    try {
      return !G.isStub("inventory") && G.inventory.count(id) >= (n || 1);
    } catch (e) {
      return false;
    }
  };
  const take = (id, n) => {
    try {
      if (!has(id, n)) return false;
      G.inventory.remove(id, n || 1);
      return true;
    } catch (e) {
      return false;
    }
  };
  const xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* */
    }
  };
  const standing = (n, why) => {
    try {
      if (!G.isStub("rpg") && G.rpg.addStanding) G.rpg.addStanding(n, why);
    } catch (e) {
      /* */
    }
  };
  const skill = (id) => {
    try {
      return G.isStub("rpg") ? 0 : G.rpg.skill(id) || 0;
    } catch (e) {
      return 0;
    }
  };
  const Q = () =>
    !G.isStub("quests") && G.quests && typeof G.quests.define === "function"
      ? G.quests
      : null;
  const qStage = (id) => {
    const q = Q();
    try {
      return q ? q.stage(id) : null;
    } catch (e) {
      return null;
    }
  };
  const qActive = (id) => {
    const q = Q();
    try {
      return !!(q && q.isActive(id));
    } catch (e) {
      return false;
    }
  };
  const qDone = (id) => {
    const q = Q();
    try {
      return !!(q && q.isComplete(id));
    } catch (e) {
      return false;
    }
  };
  const qSet = (id, st) => {
    const q = Q();
    if (q && !qDone(id)) P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => (st ? q.setStage(id, st) : q.start(id)));
  };
  const qComplete = (id) => {
    const q = Q();
    if (q && !qDone(id)) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
  const news = (text, key) =>
    P.safe("news", () => {
      if (!G.isStub("radio") && typeof G.radio.addNews === "function")
        G.radio.addNews(text, key);
    });
  const sfx = (name, o) => P.safe("sfx", () => G.sfx.play(name, o));

  // ==================================================================
  // ITEMS
  // ==================================================================
  function cloneWeapon(id, baseId, patch, def) {
    if (G.items.get(id)) return;
    const base = G.items.get(baseId);
    if (!base || !base.weapon) return;
    const w = JSON.parse(
      JSON.stringify(base.weapon, (k, v) =>
        typeof v === "function" ? undefined : v,
      ),
    );
    Object.assign(w, patch);
    G.items.define(
      Object.assign(
        {
          type: "weapon",
          weight: base.weight || 3,
          value: (base.value || 100) * 3,
          unique: true,
          weapon: w,
        },
        def,
        { id },
      ),
    );
  }
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, title, text) =>
      d({
        id,
        type: "note",
        name,
        title,
        text,
        weight: 0,
        value: 0,
        tags: ["note"],
      });
    const tape = (id, name, title, extra, text) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );
    // ---- '52' Club ----
    note(
      "m3_note_menu",
      '"52" Club Menu',
      '"52" — Supper, Saturday March 4th, 1967',
      "TO START\n  Oysters Rockefeller (Atlantic, pre-irradiated) ....... $3.25\n  Chilled Vichyssoise ................................... $1.75\n\n" +
        'THE "52" BURGER — the one the Senator ordered twice ........ $2.75\n  (Now served with 100% less French mustard. Patriotically.)\n' +
        "Chicken Hash à la Jack ........................................ $3.50\nSteak Diane, flambéed at your table ............................ $6.75\n\n" +
        "COCKTAILS\n  The Iron Curtain (vodka, beet, patriotism) ............. $1.25\n  Atomic Fizz ............................................. $1.50\n\n" +
        "A gratuity of 18% is added for parties of six or more, and for parties that mention the war.",
    );
    note(
      "m3_note_pen",
      "Scratched Note",
      "Scratched on the back of a betting slip",
      "day 11 in the pen. they race the roaches every night upstairs, you can hear the King calling the odds through the floor.\n\n" +
        'the old-timer they dragged in yesterday — Chaz, says he tended bar here "before" — keeps laughing at them. says they can dig all they want, ' +
        "Charlie's cellar never opened for a revenue man and it wont open for a raider. says the door is a wall and the key is dinner.\n\n" +
        'they took him upstairs to "ask" him. he hasnt come back.',
    );
    note(
      "m3_note_pen2",
      "Welcher's Tally",
      "Tally marks scratched into a torn racing form",
      "IIII IIII IIII II — sixteen nights.\n\nThey feed us the roaches that lose. The King says a welcher pays in silks or pays in skin, " +
        "and I got no silks.\n\nChaz says the boys will never find the cellar because they only dig where the bricks look OLD. " +
        "He says the one wall downstairs that looks too neat is the one to look at. Then he laughed till he coughed.\n\n" +
        "If you are reading this, the cage door don't lock. It never did. We just got nowhere to go.",
    );
    note(
      "m3_note_chaz",
      "Chaz's Betting Slip",
      "A betting slip, the back covered in shaky pencil",
      'Race 4 — "Big Sal" to win. (Crossed out.)\n\nWhoever finds this: I worked the bar at "52" for forty years, before and after. ' +
        "The King wants Charlie's cellar. He won't get it from me.\n\n" +
        "In 1930 the Feds raided us nine times and never found a bottle, because the cellar isn't in \"52\" at all. It's next door, under No. 19, " +
        "behind the basement wall. Two tons of brick on a hinge. There's a hole in the mortar no bigger than a pencil — you slide a meat skewer " +
        "through it and trip the latch. Kitchen's got a rack of 'em.\n\nThe Mayor's Reserve is still down there. Drink one for old Chaz. " +
        "And for God's sake, bet against Big Sal.",
    );
    tape(
      "m3_reel_sommelier",
      "Sommelier's Tape Reel",
      'Tape reel: "Cellar Book — Final Entries"',
      { learn: ["m3_locker_vanderhoof", "m3_locker_bradberton"] },
      '[A dry, patient voice. Glass clinks somewhere near the microphone.]\n\n"March 5th. The sirens started during the breakfast service. I have sent the staff to the subway and bolted the hatch. ' +
        "Somebody must stay with the collection; it would be an insult to leave a '32 Bourbon alone at a time like this.\n\n" +
        "...December the somethingth. The door is sealed and I have decided not to open it. The air is fine. The company is excellent: " +
        "two thousand bottles and not one of them has asked me about the war.\n\n" +
        "...I have been through the Burgundies. I am saving the Mayor's Reserve. One should always save the best for the end, and I believe " +
        "the end is being very courteous about arriving.\n\n" +
        "P.S. for the cellar book: Mrs. Vanderhoof's private locker is 1-9-3-1, Mr. Bradberton's is 4-4-2-2. They will not be needing them.\n\n" +
        'To whoever opens the door: the skewer goes back on the rack. Enjoy the Reserve. It was never meant for a mayor anyway."\n\n[Click.]',
    );
    d({
      id: "m3_meat_skewer",
      type: "key",
      name: "Meat Skewer",
      weight: 0.1,
      value: 1,
      quest: true,
      desc: 'A foot of stainless steel from the "52" kitchen, filed to a point. Good for shish kebab, better for secret doors.',
    });
    d({
      id: "m3_mayors_reserve",
      type: "aid",
      name: "The Mayor's Reserve",
      weight: 1,
      value: 450,
      mesh: "bottle_whiskey",
      sound: "drink",
      tags: ["drink", "alcohol", "unique"],
      effects: {
        hp: 40,
        duration: 600,
        attrs: { presence: 3, senses: 2, brawn: 1 },
        rads: -5,
        addiction: {
          chance: 0.02,
          id: "alcohol",
          name: "Alcohol Addiction",
          withdrawal: { attrs: { presence: -1, reflex: -1 } },
        },
      },
      desc: "Kentucky straight bourbon, bottled 1932, hidden from the Feds, the Mayor and the end of the world. It tastes like caramel, oak and very good decisions.",
    });
    d({
      id: "m3_jockey_cap",
      type: "apparel",
      slot: "head",
      name: "Jockey King's Silks Cap",
      weight: 0.5,
      value: 90,
      dr: 1,
      attrs: { reflex: 1, senses: 1 },
      tags: ["apparel", "hat"],
      mesh: "hat_officer",
      desc: "A satin racing cap in red and gold, stolen off a lawn jockey and sized up with a knife. Makes you feel faster. You aren't.",
    });
    P.safe("item:photo_finish", () =>
      cloneWeapon(
        "m3_photo_finish",
        "hunting_rifle",
        {
          damage: 38,
          critMult: 3,
          critChance: 4,
          condDecay: 0.0018,
          reloadTime: 2.4,
        },
        {
          name: "Photo Finish",
          value: 1400,
          desc: "The Jockey King's hunting rifle, its walnut stock inlaid with a mother-of-pearl horseshoe and eleven notches. Always wins by a nose.",
        },
      ),
    );
    // ---- Helmsley ----
    note(
      "m3_note_eviction",
      "Notice to Occupants",
      "NOTICE TO ALL OCCUPANTS OF 230 PARK AVENUE",
      "By order of the Continuity, lawful government of the United States of America, this structure is requisitioned for national signals purposes.\n\n" +
        "Occupants will vacate within one (1) hour. Occupants who are not able to vacate will be assisted.\n\n" +
        "Occupants who are mutated, irradiated, or otherwise of impure stock will be assisted first.\n\n— Lt. A. Voss, Detachment 7\n\n" +
        "[Scrawled underneath in charcoal:] WE LIVED HERE 20 YEARS",
    );
    tape(
      "m3_reel_duty",
      "Detachment 7 Duty Log",
      "Tape reel: Detachment 7 — Duty Log",
      { learn: "m3_armory_locker" },
      "[Clipped, military voice.] \"Duty log, Detachment 7, Relay Seven. Day 412.\n\nRelay performance nominal. Carrier repeating the President's addresses on the midtown band " +
        "and passing patrol telemetry to the Sky-Eye drones. The locals have started calling the beacon 'the red eye'. Morale effect: positive.\n\n" +
        "Reminder: the relay maintenance codes are to remain in the Lieutenant's personal possession at ALL times, not in the safe, not on a sticky note on " +
        "the console, Corporal Deane. The same goes for the armory locker: three-one-nine-seven is NOT to be chalked on the cage.\n\nThe express car to the crown is running again. The freight car is parked at the top and stays there. Nobody comes up from the lobby we don't send for.\"",
    );
    note(
      "m3_note_voss",
      "Voss's Orders",
      "ORDERS — DETACHMENT 7 (EYES ONLY)",
      "RELAY SEVEN is the Continuity's eye and voice over Manhattan until the Restoration is complete.\n\n1. Maintain the carrier at all costs.\n2. Should the station be " +
        'overrun, OVERLOAD THE CORE. Under no circumstances allow the transmitter to fall into the hands of the so-called "Radio Free Manhattan" — ' +
        "a relay of this power would put that degenerate jazz on every goggles from the Battery to Harlem.\n3. Destroy these orders.\n\n[They were not destroyed.]",
    );
    d({
      id: "m3_relay_codes",
      type: "key",
      name: "Relay 7 Code Card",
      weight: 0,
      value: 0,
      quest: true,
      learn: "m3_helms_relay",
      desc: "A laminated card of carrier frequencies and override codes for Continuity Relay 7, New York Central Building. Console passcode: REDEYE. Stamped EYES ONLY. Also, faintly, with a coffee ring.",
    });
    P.safe("item:park_ave_express", () =>
      cloneWeapon(
        "m3_park_ave_express",
        "gyrojet_pistol",
        {
          damage: 40,
          rof: 2.8,
          magSize: 8,
          critChance: 2,
          condDecay: 0.0015,
          skin: "gold",
        },
        {
          name: "Park Avenue Express",
          value: 2200,
          desc: "A Continuity officer's gyrojet pistol with a gold-plated frame engraved with the New York Central's old herald. Runs hot, runs fast, never late.",
        },
      ),
    );
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function defineTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    const T = (id, def) =>
      P.safe("term:" + id, () => G.terminals.register(id, def));
    T("m3_club52_ledger", {
      title: "THE KING'S BOOK",
      header:
        '"52" CLUB — MANAGER\'S OFFICE\nMeridian Telelink (property of the Jockey King, touch it and die)',
      entries: [
        {
          title: "Tonight's Card",
          text: "RACE 1 — Big Sal / Lil Sal / Six Legs / Glowie / Ha'penny\nRACE 2 — same roaches, they don't know\nRACE 3 — Six Legs is fixed to lose. Don't tell Six Legs.\nRACE 4 — Big Sal to win (the King's money is on Big Sal)\nRACE 5 — winner gets eaten",
        },
        {
          title: "The King's Safe",
          learn: "m3_king_safe",
          text: "Combination: 1-1-0-5. Eleven wins, no losses, five-to-one. The King's lucky numbers.\nIf you are reading this and you are not the King: the King knows.",
        },
        {
          title: "Debts Owed",
          text: 'Scabby Pete ........ 40 scrip (fingers: 2 left)\nThe Hollister kid .. 15 scrip\nMad Dora ........... 60 scrip (DO NOT collect, she bites)\nThe Covenant .... 0 scrip, 1 insult — collect later\nChaz (old bartender) .. "the cellar" — see below',
        },
        {
          title: "RE: Charlie's Cellar",
          text:
            'Every old-timer in Midtown says "52" had a secret cellar in the Prohibition. Two thousand bottles. The MAYOR\'S private stash.\n\n' +
            'We have torn out the kitchen walls, the coat check, the ice room and Dutch\'s left ear. Nothing.\n\nThe old bartender knows. He keeps saying "the door is a wall and the key is dinner". ' +
            "Keep asking him until he stops being funny.\n\nUPDATE: he stopped being funny. Also stopped breathing. Dump him downstairs.",
        },
      ],
    });
    T("m3_helms_checkpoint", {
      title: "CHECKPOINT 7",
      header: "CONTINUITY — DETACHMENT 7\nAccess Control Telelink",
      entries: [
        {
          title: "Standing Orders",
          text: "All persons approaching Checkpoint 7 are to be challenged ONCE.\nPersons without clearance are to be removed from the gene pool.\nDo not engage the old drunk who waves at the portal every morning. He is harmless and it is bad for morale when we miss.",
        },
        {
          title: "Portal Traffic (last 24h)",
          text: "Northbound portal: 0 vehicles, 3 burrow rats (neutralized), 1 Covenant scout (observed, withdrew)\nSouthbound portal: 0 vehicles, 1 trade wagon (turned back, pack oxen confiscated — tasty)",
        },
        {
          title: "Elevator Status",
          text: "LOBBY CARS 1-6 ....... DEAD SINCE 1967\nEXPRESS (3rd → CROWN) .. OPERATIONAL\nFREIGHT ............... PARKED AT CROWN (security)",
        },
      ],
    });
    T("m3_helms_barracks", {
      title: "DETACHMENT 7 — QUARTERS",
      header:
        "CONTINUITY PERSONNEL TERMINAL\n(formerly N.Y. CENTRAL — DISPATCH DESK 4)",
      entries: [
        {
          title: "Watch Bill",
          learn: "m3_helms_officer",
          text: "Lobby checkpoint ....... Pvt. Kearney, Pvt. Adeyemi\nCrown relay ........... Cpl. Deane, EB-117 (Sky-Eye drone)\nOfficer on duty ....... Lt. A. Voss (permanently, apparently)\n\nDuty officer's teletype passcode this month: GILDEDCROWN. (Deane — STOP posting it on the watch bill. — V.)",
        },
        {
          title: "Found in Desk 4 (old-world file)",
          text: 'MEMO, NEW YORK CENTRAL SYSTEM, 03/02/67:\nThe Civil Defense "special" to the upstate shelters will depart the lower level at 06:00 daily until further notice. Seats by lottery. The executive floors will NOT be taking the lottery; the executive floors have made other arrangements.\n\n[There is no record of what the other arrangements were.]',
        },
        {
          title: "Personal: Pvt. Kearney",
          text: "Letter #31 to Mom (unsent). The city is not like the briefing films. There's a band on the radio from somewhere uptown that plays every night. I'm not supposed to listen. I listen.",
        },
      ],
    });
    T("m3_helms_comms", {
      title: "RADIO ROOM",
      header: "CONTINUITY SIGNALS — MIDTOWN BAND\nRelay 7 Monitor",
      entries: [
        {
          title: "Relay Status",
          text: () =>
            F.relay === "off"
              ? "RELAY 7: NO CARRIER\nCrown reports: [NO RESPONSE]"
              : F.relay === "rfm"
                ? 'RELAY 7: CARRIER HIJACKED\nNow repeating: "RADIO FREE MANHATTAN"\n(Please stop tapping the monitor. It is still jazz.)'
                : "RELAY 7: CARRIER NOMINAL\nRepeating: Presidential Address #212, #213, #214\nSky-Eye drone telemetry: 11 units reporting",
        },
        {
          title: "Intercepts",
          text: '"...this is Radio Free Manhattan, coming to you from the top of Radio City, and to our friends in the black armor: we can hear you breathing, fellas..."\n\n[Operator note: jam this. Operator note 2: can\'t, their antenna is taller. Operator note 3: get a taller antenna.]',
        },
      ],
    });
    T("m3_helms_officer", {
      title: "LT. A. VOSS",
      header: "CONTINUITY — OFFICER'S TERMINAL\nDetachment 7",
      lock: P.LOCKS.officer_term,
      entries: [
        {
          title: "Safe",
          learn: "m3_officer_safe",
          text: "Office safe combination reset to 0-7-1-2 after the Deane incident.",
        },
        {
          title: "Report to Liberty Station (draft)",
          text: 'Relay 7 fully operational. Local population pacified, relocated, or reclassified. Request replacement Sky-Eye drones (EB-109 fell off the crown again).\n\nNote: the squatters in the lower lobby have been removed. One of them called the building "home". Filed as a threat.',
        },
        {
          title: "Relay Codes",
          text: "Maintenance codes are on my person. Where they belong. Nice try, Deane.",
        },
        {
          title: "Personal Log",
          text: "Sometimes at night the lantern floodlights come on by themselves — some old timer circuit from before the war — and the whole crown glows gold. The men say it looks like the city is still alive. I have told them it does not.",
        },
      ],
    });
    T("m3_helms_relay", {
      title: "RELAY 7 — CARRIER CONTROL",
      header:
        "CONTINUITY SIGNALS CORPS\nRelay 7 Master Console · Meridian Telelink",
      lock: P.LOCKS.relay_term,
      onUnlock: () => {
        if (qActive("m3_dead_air")) qSet("m3_dead_air", "silence");
      },
      entries: [
        {
          title: "Carrier Status",
          text: () =>
            F.relay === "off"
              ? "CARRIER: NONE\nCORE: SLAG"
              : F.relay === "rfm"
                ? "CARRIER: 97.3 — SOURCE: RADIO CITY (external)\nMODE: REPEATER\nPOWER: 100%"
                : "CARRIER: CONTINUITY MIDTOWN BAND\nSOURCE: MOUNT WEATHER UPLINK\nSKY-EYE DRONES TELEMETRY: 11 UNITS\nPOWER: 100%",
        },
        {
          title: "OVERLOAD CORE (irreversible)",
          cond: () => F.relay === "on",
          text: "Overload sequence armed.",
          action: () => {
            C.overloadRelay();
            return "CORE TEMPERATURE: CRITICAL\nCARRIER LOST\n...\n...\n[The terminal screen fills with static.]";
          },
        },
        {
          title: "RE-TUNE CARRIER: Radio Free Manhattan",
          cond: () => F.relay === "on",
          text: "Re-tuning.",
          action: () => {
            C.retuneRelay();
            return "EXTERNAL SOURCE ACQUIRED: 97.3\nREPEATER MODE ENGAGED\nPOWER: 100%\n\n[Somewhere under the pyramid a trumpet starts playing.]";
          },
        },
        {
          title: "Beacon Test",
          cond: () => F.relay !== "off",
          text: () =>
            F.relay === "rfm"
              ? "BEACON: GREEN (non-standard — please report)"
              : "BEACON: RED (standard)",
        },
      ],
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    const inOrOut = (poi, inName, label, outLabel) => () =>
      P.inCell(poi)
        ? mk(poi, inName, label)()
        : mk(poi, "exterior_entrance", outLabel)();
    P.safe("quest:cellar", () =>
      q.define({
        id: "m3_cellar",
        name: "Behind the Brick",
        giver: "Chaz",
        location: '"52" Club',
        desc: 'The "52" Club hid a Prohibition wine cellar that the Feds never found. The raiders who call themselves the Jockeys have torn the club apart looking for it. An old bartender took the secret to his grave — almost.',
        stages: [
          {
            id: "find",
            text: 'Find the hidden wine cellar of the "52" Club.',
            markers: inOrOut(
              "club_52",
              "basement",
              "The Basement",
              '"52" Club',
            ),
          },
          {
            id: "open",
            text: "Open the hidden door in the basement wall. (A meat skewer from the kitchen should trip the latch.)",
            markers: () =>
              has("m3_meat_skewer")
                ? inOrOut("club_52", "secret_wall", "Brick Wall", '"52" Club')()
                : inOrOut(
                    "club_52",
                    "skewer",
                    "Kitchen Skewer Rack",
                    '"52" Club',
                  )(),
          },
          {
            id: "claim",
            text: "Claim the Mayor's Reserve in the wine cellar.",
            markers: inOrOut(
              "club_52",
              "reserve",
              "The Mayor's Reserve",
              '"52" Club',
            ),
          },
        ],
        rewards: { xp: 300, scrip: 0 },
      }),
    );
    P.safe("quest:dead_air", () =>
      q.define({
        id: "m3_dead_air",
        name: "Red Eye",
        giver: "Relay 7",
        location: "New York Central Building",
        desc: 'The Continuity have bolted a signals relay onto the gilded crown of the New York Central Building. "The red eye" repeats their broadcasts across Midtown and spots for their patrols. Whoever holds the crown holds the airwaves.',
        stages: [
          {
            id: "reach",
            text: "Reach Relay 7 in the crown of the New York Central Building (the express elevator on the 3rd floor).",
            markers: () =>
              P.inCell("helmsley")
                ? G.player && G.player.pos.y - P.I("helmsley").y > 11
                  ? mk("helmsley", "express", "Express Elevator")()
                  : mk("helmsley", "stairs", "Stairs")()
                : mk(
                    "helmsley",
                    "exterior_entrance",
                    "New York Central Building",
                  )(),
          },
          {
            id: "silence",
            text: "Silence Relay 7: overload the transmitter core — or re-tune it to carry Radio Free Manhattan.",
            markers: inOrOut(
              "helmsley",
              "relay_console",
              "Relay Console",
              "New York Central Building",
            ),
          },
        ],
        rewards: { xp: 450, standing: 10 },
      }),
    );
  }

  // ==================================================================
  // SET PIECES
  // ==================================================================
  // ---------- '52': the two-ton door ----------
  C.openCellar = function (instant) {
    const T = P.club52;
    if (!T || T.open) return;
    T.open = true;
    F.cellarOpen = true;
    if (T.leafCol) {
      P.safe("rmcol", () => G.world.removeCollider(T.leafCol));
      T.leafCol = null;
    }
    // the swung-open leaf (x 7.8..10 at the hinge line z -7) is still two tons of brick: give it a collider
    if (!T.openCol) {
      const lp = T.leaf.position;
      T.openCol = P.safe("opencol", () =>
        G.world.addBox(
          lp.x - 2.2,
          lp.y,
          lp.z - 0.25,
          lp.x,
          lp.y + 2.5,
          lp.z + 0.25,
          { tag: "poi", walkable: false },
        ),
      );
    }
    if (instant) {
      T.leaf.rotation.y = HP;
      T.anim = 1;
      return;
    }
    T.anim = 0.0001;
    sfx("cryo_door", { volume: 0.6, pitch: 0.7 });
    if (G.player) P.safe("shake", () => G.player.shake(0.25, 1.6));
    G.notify(
      "With a deep grinding groan, two tons of brick swing inward on a hidden hinge.",
    );
    if (!qDone("m3_cellar")) {
      qStart("m3_cellar", "claim");
      qSet("m3_cellar", "claim");
    }
    xp(40, "Found Charlie's cellar");
  };
  function tickCellar(dt) {
    const T = P.club52;
    if (!T || !T.anim || T.anim >= 1) return;
    T.anim = Math.min(1, T.anim + dt / 3.2);
    const e =
      T.anim < 0.5 ? 2 * T.anim * T.anim : 1 - Math.pow(-2 * T.anim + 2, 2) / 2;
    T.leaf.rotation.y = HP * e;
  }
  // ---------- Helmsley: Relay 7 ----------
  const RELAY_COL = { on: 0x5aa0ff, off: 0x000000, rfm: 0xffb040 };
  function applyRelay() {
    const R = P.helmsRelay,
      B = P.helmsBeacon;
    if (R) {
      R.ringMat.emissive.setHex(RELAY_COL[F.relay] || 0x5aa0ff);
      R.ringMat.emissiveIntensity = F.relay === "off" ? 0 : 1.8;
      R.ringMat.color.setHex(F.relay === "off" ? 0x151515 : 0x1a2a40);
      if (R.glow) R.glow.visible = F.relay !== "off";
      if (R.orb) R.orb.scale.setScalar(F.relay === "off" ? 0.8 : 1);
    }
    if (B) {
      B.mat.emissive.setHex(F.relay === "rfm" ? 0x40ff60 : 0xff2a1a);
      B.mat.emissiveIntensity = F.relay === "off" ? 0 : 2.4;
      if (B.glow) {
        B.glow.visible = F.relay !== "off";
        P.safe("bcol", () => {
          if (B.glow.material && B.glow.material.color)
            B.glow.material.color.setHex(
              F.relay === "rfm" ? 0x40ff60 : 0xff3020,
            );
        });
      }
    }
  }
  C.overloadRelay = function () {
    if (F.relay !== "on") return;
    F.relay = "off";
    const a = A("helmsley", "relay");
    if (a) {
      const p = new THREE.Vector3(a.x, a.y + 4, a.z - 3);
      P.safe("boom", () => {
        if (!G.isStub("fx")) {
          G.fx.explosion(p, 2.5, "plasma");
          G.fx.sparks(p);
          G.fx.smoke(p.clone().add(new THREE.Vector3(0, 2, 0)), 1.5);
        }
      });
      sfx("explosion", { pos: p, volume: 0.8 });
      if (G.player) P.safe("shake", () => G.player.shake(0.6, 1.2));
    }
    applyRelay();
    G.notify(
      "Relay 7 is dead. For the first time in a year, the midtown band is silent.",
    );
    standing(10, "Silenced the Continuity relay");
    news(
      "Word from Midtown, folks: the Continuity's big red eye on top of the New York Central Building went dark tonight. Somebody walked right up to the crown and pulled the plug. Whoever you are — the drinks at Radio City are on me.",
      "m3_relay_off",
    );
    qComplete("m3_dead_air");
    G.events.emit("continuityRelaySilenced", { id: "helmsley", mode: "off" });
  };
  C.retuneRelay = function () {
    if (F.relay !== "on") return;
    F.relay = "rfm";
    applyRelay();
    sfx("terminal_success");
    G.notify(
      "Relay 7 now repeats Radio Free Manhattan across Midtown. The beacon on the mast turns green.",
    );
    standing(20, "Gave the airwaves back to the city");
    xp(100, "Re-tuned Relay 7");
    news(
      "Well, well, well. If you're hearing this a little louder than usual, Midtown, that's because somebody just hijacked the Continuity's own relay on the New York Central Building and pointed it at us. The red eye is green now, baby. This one's for you, whoever you are.",
      "m3_relay_rfm",
    );
    qComplete("m3_dead_air");
    G.events.emit("continuityRelaySilenced", { id: "helmsley", mode: "rfm" });
  };
  let relayT = 0;
  function tickRelay(dt, realDt) {
    relayT += realDt;
    const R = P.helmsRelay,
      B = P.helmsBeacon;
    if (R && P.inCell("helmsley") && F.relay !== "off") {
      const k = F.relay === "rfm" ? 0.4 : 1.2;
      R.rings.children.forEach((m, i) => {
        if (m.geometry && m.geometry.type === "TorusGeometry")
          m.rotation.z += realDt * k * (i % 2 ? -1 : 1) * (1 + i * 0.3);
      });
      R.ringMat.emissiveIntensity =
        1.4 + Math.sin(relayT * (F.relay === "rfm" ? 2 : 6)) * 0.5;
    }
    if (B && F.relay === "on") {
      const on = relayT % 1.6 < 0.35;
      B.mat.emissiveIntensity = on ? 3.0 : 0.15;
      if (B.glow) B.glow.visible = on;
    } else if (B && F.relay === "rfm") {
      B.mat.emissiveIntensity = 1.6 + Math.sin(relayT * 1.5) * 0.6;
    }
    // Continuity searchlight on the crown terrace: night only, sweeps Park Ave → 47th St; dies with the relay
    const SL = B && B.search;
    if (SL) {
      let night = 0;
      try {
        const env = G.atmos && G.atmos._ && G.atmos._.env;
        night = env ? env.night || 0 : 0;
      } catch (e) {
        night = 0;
      }
      const on = F.relay !== "off" && night > 0.05;
      if (SL.beam.visible !== on) SL.beam.visible = on;
      SL.lens.material.color.setHex(F.relay === "off" ? 0x1a1a1a : 0xeef4ff);
      if (on) {
        SL.beamMat.opacity = 0.12 * Math.min(1, night * 1.3);
        SL.pivot.rotation.y =
          2.4 + Math.sin(relayT * 0.2) * 0.9 + Math.sin(relayT * 0.53) * 0.12;
      }
    }
  }

  // ==================================================================
  // NAMED BOSSES
  // ==================================================================
  /** A named actor restored by combat from a save keeps its id but loses the onDeath closure: re-attach it, and if
   *  it came back already dead, record the death now (so it can never respawn on a later load). */
  function rebind(a, fn) {
    if (!a) return;
    if (a.dead) {
      P.safe("rebind:" + a.id, fn);
      return;
    }
    if (!a.onDeath) a.onDeath = fn;
  }
  function spawnVoss() {
    if (
      F.vossDead ||
      G.isStub("actors") ||
      typeof G.actors.spawn !== "function"
    )
      return;
    const ex = actor("m3_voss");
    if (ex) {
      rebind(ex, () => {
        F.vossDead = true;
      });
      return;
    }
    const a = A("helmsley", "boss");
    if (!a) return;
    P.safe("spawn:voss", () =>
      G.actors.spawn({
        id: "m3_voss",
        type: "continuity_soldier",
        name: "Lieutenant Voss",
        faction: "continuity",
        level: 15,
        hostile: true,
        pos: { x: a.x, y: a.y, z: a.z },
        yaw: a.yaw || 0,
        ai: "guard",
        home: { x: a.x, z: a.z, r: 5 },
        noRespawn: true,
        inventory: [
          ["m3_relay_codes", 1],
          ["m3_note_voss", 1],
        ],
        barks: [
          "This relay belongs to the United States of America!",
          "You are unauthorized. And unwashed.",
          "Deane! Overload the — never mind, I'll do it myself!",
          "For the Continuity!",
        ],
        onDeath: () => {
          F.vossDead = true;
        },
      }),
    );
  }
  // The Jockeys and the relay crew: extra named defenders on top of combat's location population (club_52 only gets
  // 3 raiders + the boss from the layout record — too thin for a four-level raider den; the relay room had no escort).
  const EXTRA = [
    {
      id: "m3_jockey_bookie",
      poi: "club_52",
      anchor: "spawn8",
      type: "raider",
      name: "Jockey Bookie",
      level: 6,
      barks: [
        "Odds just went up, pal!",
        "Pay up or lay down!",
        "House always wins!",
      ],
    },
    {
      id: "m3_jockey_stable",
      poi: "club_52",
      anchor: "spawn7",
      type: "raider",
      name: "Jockey Stablehand",
      level: 5,
      barks: ["Who let the softling in the stable?", "Get off my bedroll!"],
    },
    {
      id: "m3_jockey_enforcer",
      poi: "club_52",
      anchor: "spawn6",
      type: "raider",
      name: "Jockey Enforcer",
      level: 7,
      barks: ["The King don't take visitors!", "You're a scratch, buddy!"],
    },
    {
      id: "m3_helms_signals",
      poi: "helmsley",
      anchor: "spawn6",
      type: "continuity_soldier",
      name: "Continuity Signals Officer",
      level: 12,
      barks: ["Relay room is off limits!", "Contact in the crown!"],
    },
    {
      id: "m3_helms_crownguard",
      poi: "helmsley",
      anchor: "crown_guard",
      type: "continuity_soldier",
      name: "Continuity Crown Guard",
      level: 13,
      barks: [
        "Halt! This is a restricted floor!",
        "Intruder at the express car!",
      ],
    },
  ];
  function spawnExtras() {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return;
    F.extraDead = F.extraDead || [];
    for (const e of EXTRA) {
      if (F.extraDead.indexOf(e.id) >= 0) continue;
      const ex = actor(e.id);
      if (ex) {
        rebind(ex, () => {
          if (F.extraDead.indexOf(e.id) < 0) F.extraDead.push(e.id);
        });
        continue;
      }
      const a = A(e.poi, e.anchor);
      if (!a) continue;
      const faction = e.type === "raider" ? "raiders" : "continuity";
      P.safe("spawn:" + e.id, () =>
        G.actors.spawn({
          id: e.id,
          type: e.type,
          name: e.name,
          faction,
          level: e.level,
          hostile: true,
          pos: { x: a.x, y: a.y, z: a.z },
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 6 },
          noRespawn: true,
          barks: e.barks,
          onDeath: () => {
            if (F.extraDead.indexOf(e.id) < 0) F.extraDead.push(e.id);
          },
        }),
      );
    }
  }
  /** Combat names the '52' raider boss "Raider Boss" — make him the Jockey King (once per spawn). */
  function tickKing() {
    if (
      !P.inCell("club_52") ||
      G.isStub("actors") ||
      typeof G.actors.list !== "function"
    )
      return;
    for (const a of G.actors.list()) {
      if (!a || a.dead || a._m3King || a.group !== "club_52") continue;
      if (a.isBoss || a.name === "Raider Boss") {
        a._m3King = true;
        a.name = "The Jockey King";
        a.customBarks = [
          "And they're OFF!",
          "Nobody welches on the King!",
          "Place your bets, softling!",
          "Photo finish! Photo finish!",
        ];
        try {
          a.inventory = a.inventory || [];
          a.inventory.push(["m3_jockey_cap", 1], ["scrip", 60]);
        } catch (e) {
          /* */
        }
      }
    }
  }

  // ==================================================================
  // INTERACTABLES
  // ==================================================================
  function interactables() {
    const W = G.world;
    // the brick wall
    const sw = A("club_52", "secret_wall");
    if (sw)
      W.addInteractable({
        pos: new THREE.Vector3(sw.x - 0.3, sw.y + 1.2, sw.z),
        radius: 1.1,
        priority: 0.8,
        label: () => (F.holeFound ? "Brick Wall (pin-hole)" : "Brick Wall"),
        verb: () =>
          !F.holeFound
            ? "Examine"
            : has("m3_meat_skewer")
              ? "Insert Skewer"
              : "Examine",
        enabled: () => !F.cellarOpen,
        onInteract() {
          if (!F.holeFound) {
            F.holeFound = true;
            G.notify(
              "One brick in this wall has a neat round hole in its mortar — no wider than a pencil. The pointing around this section is far too clean.",
            );
            qStart("m3_cellar", "open");
            qSet("m3_cellar", "open");
            return;
          }
          if (has("m3_meat_skewer")) {
            G.notify(
              "You slide the skewer into the hole. Something clicks deep inside the wall.",
            );
            P.safe("unlock", () => {
              if (P.locksLive()) G.locks.unlock(P.LOCKS.cellar_wall.id);
            });
            C.openCellar(false);
            return;
          }
          sfx("ui_error");
          G.notify(
            "You need something long, thin and stiff to reach whatever is behind that hole. The kitchen had a rack of meat skewers.",
          );
        },
      });
  }

  // ==================================================================
  // lifecycle
  // ==================================================================
  function resetWorld() {
    const T = P.club52;
    if (T && T.openCol) {
      P.safe("rmopencol", () => G.world.removeCollider(T.openCol));
      T.openCol = null;
    }
    if (T) {
      T.open = false;
      T.anim = 0;
      T.leaf.rotation.y = 0;
      if (!T.leafCol)
        T.leafCol = G.world.addBox(
          T.leaf.position.x - 0.25,
          T.leaf.position.y,
          T.leaf.position.z - 2.2,
          T.leaf.position.x + 0.25,
          T.leaf.position.y + 2.5,
          T.leaf.position.z,
          { tag: "poi", walkable: false },
        );
    }
  }
  function applyWorldState() {
    if (F.cellarOpen) C.openCellar(true);
    applyRelay();
  }
  G.events.on("itemAdded", (id) => {
    if (id === "m3_note_chaz" || id === "m3_note_pen") {
      if (!qActive("m3_cellar") && !qDone("m3_cellar"))
        qStart("m3_cellar", F.holeFound ? "open" : "find");
    } else if (id === "m3_mayors_reserve" && !F.reserveTaken) {
      F.reserveTaken = true;
      qStart("m3_cellar", "claim");
      qComplete("m3_cellar");
    } else if (id === "m3_reel_duty" || id === "m3_relay_codes")
      qStart("m3_dead_air", "reach");
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "m3_voss") F.vossDead = true;
    if (a && EXTRA.some((e) => e.id === a.id)) {
      F.extraDead = F.extraDead || [];
      if (F.extraDead.indexOf(a.id) < 0) F.extraDead.push(a.id);
    }
  });
  G.events.on("locationDiscovered", (loc) => {
    const id = loc && (loc.id || loc);
    if (id === "helmsley") qStart("m3_dead_air", "reach");
  });

  P.onPreReady.push(() => {
    defineItems();
    defineTerminals();
    defineQuests();
  });
  P.onReady.push(() => {
    interactables();
  });
  P.onReset.push(() => {
    resetWorld();
    F = DEF_STATE();
    applyRelay();
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnVoss();
    spawnExtras();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnVoss();
    spawnExtras();
  });
  let slow = 0;
  P.tick.push((dt, realDt) => {
    tickCellar(realDt);
    tickRelay(dt, realDt);
    slow -= realDt;
    if (slow > 0) return;
    slow = 0.5;
    tickKing();
    // reaching the crown advances "Dead Air"
    const pp = G.player && G.player.pos;
    if (
      pp &&
      P.inCell("helmsley") &&
      pp.y - P.I("helmsley").y > 50 &&
      F.relay === "on"
    ) {
      if (!qActive("m3_dead_air")) qStart("m3_dead_air", "silence");
      else if (qStage("m3_dead_air") === "reach")
        qSet("m3_dead_air", "silence");
    }
  });
})();
