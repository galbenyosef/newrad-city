/* src/poi_ues/80_content.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 80 content
 * Notes, tape reels, valuables, keys and teletype terminals for the four
 * Upper East Side POIs, plus every lock in the module (P.LOCKS).
 * Each lock's unlock is placed in this module:
 *   frick_safe        code 1914   Pemberton's note (Frick, upstairs) + Frick security teletype
 *   coop_safe         code 1835   the curator's note (Carnegie Mansion, ground floor)
 *   gracie_treasury   code 6248   council minutes (Gracie Mansion, Mayor's study) + rolls teletype
 *   armory_footlocker code 0717   the Major's standing orders (Board of Officers Room)
 *   armory_safe       code 1806   the range-office teletype (Armory basement)
 *   armory_cage       key         ues_key_armory_cage, on the Major's desk (Board of Officers Room)
 * The Carnegie coal-cellar hatch is a one-way door (bolted from below), not a lock.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._ues) return;
  const P = G._ues;

  // ------------------------------------------------------------------
  // Locks (referenced by the site builders, which run in init)
  // ------------------------------------------------------------------
  P.LOCKS = {
    frick_safe: {
      id: "ues_frick_safe",
      label: "Mr. Frick's Wall Safe",
      kind: "safe",
      code: "1914",
      hint: "Pemberton the butler's note upstairs in the Frick; the security teletype.",
    },
    coop_safe: {
      id: "ues_coop_safe",
      label: "Carnegie's Safe",
      kind: "safe",
      code: "1835",
      hint: "The curator's note on the Carnegie Mansion ground floor.",
    },
    gracie_treasury: {
      id: "ues_gracie_treasury",
      label: "City Treasury",
      kind: "safe",
      code: "6248",
      hint: "The council minutes in the Mayor's study at Gracie Mansion.",
    },
    armory_footlocker: {
      id: "ues_armory_footlocker",
      label: "Major Callahan's Footlocker",
      kind: "container",
      code: "0717",
      hint: "The Major's standing orders in the Board of Officers Room.",
    },
    armory_safe: {
      id: "ues_armory_safe",
      label: "Regimental Safe",
      kind: "safe",
      code: "1806",
      hint: "The range-office teletype in the Armory basement.",
    },
    armory_cage: {
      id: "ues_armory_cage",
      label: "Regimental Armoury",
      kind: "door",
      key: "ues_key_armory_cage",
      hint: "The key lies on Major Callahan's desk in the Board of Officers Room.",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);

  // ------------------------------------------------------------------
  // Items
  // ------------------------------------------------------------------
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "note",
            name,
            title: name,
            text,
            weight: 0,
            value: 0,
            tags: ["note"],
          },
          extra || {},
        ),
      );
    const tape = (id, name, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title: name,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );

    // ---- The Frick ----
    note(
      "ues_note_frick_pemberton",
      "Butler's Note (Pemberton)",
      "To the attendant units —\n\nThe gentlemen of the house will dine at eight, as they have every evening since the sirens. Set for twelve. Polish the Gainsborough silver. Do NOT let the frogs into the Garden Court again.\n\nMr. Frick's wall safe keeps the house combination he chose when the walls were new: 1-9-1-4. Should anything happen to me, the attendants are to open it for the next gentleman who asks politely.\n\n— H. Pemberton, Butler",
      { learn: "ues_frick_safe" },
    );
    tape(
      "ues_reel_frick_conservator",
      "Tape Reel: Conservator's Log",
      '[A woman\'s voice, close to the microphone, water dripping somewhere.]\n\n"Day nine in the art storage. The pumps quit this morning. I have the Vermeer up on the top rack, wrapped in three layers of glassine and a raincoat. If anyone hears this: she is the only thing in this building that was ever finished. Take her somewhere dry. Please. She has been waiting since 1665."',
    );
    note(
      "ues_note_frick_thief",
      "Scrawled Inventory",
      'GOT: 2 candlesticks (silver?), 1 clock (heavy), 1 small painting of a lady with a letter — NO, the robot took it back.\nTHE ROBOTS DON\'T SHOOT. THEY JUST WALK YOU TO THE DOOR AND SAY "THE COLLECTION IS CLOSED".\nTried three times. Going to try the basement.',
    );
    d({
      id: "ues_painting_vermeer",
      type: "misc",
      name: "Small Dutch Painting (Lady with a Letter)",
      weight: 1,
      value: 900,
      tags: ["valuable", "art"],
      desc: "A canvas no bigger than a newspaper page: a woman reading by a window, light falling across her sleeve. Dry, somehow. Someone took great care of it.",
    });

    // ---- Carnegie Mansion ----
    note(
      "ues_note_coop_curator",
      "Curator's Memo",
      "STREAMLINE! — installation notes\n\nThe 1938 locomotive model goes in Mr. Carnegie's library safe overnight, NOT on the plinth. The safe still answers to the combination the Carnegie family used for everything: the year he was born, 1835. Yes, really. Yes, I have told Security.\n\n— M. Albright, Assistant Curator, Product Design",
      { learn: "ues_coop_safe" },
    );
    tape(
      "ues_reel_coop_carnegie",
      'Tape Reel: "The Gospel of Wealth" (Reading)',
      '[An actor, reading for a museum audio tour.]\n\n"The man who dies thus rich dies disgraced." [A pause. The actor, off-script:] "Funny line to record in a house with gold taps, isn\'t it?" [A technician laughs. The tape runs on in silence.]',
    );
    note(
      "ues_note_coop_ransom",
      "Ransom Note (unsent)",
      'TO WHOEVER RUNS GRACIE MANSION\n\nWe got your man. He says he is a "town councilman". We say he is worth 300 scrip and a crate of shells. Leave it by the Peter Pan statue. The Decorator says if you are late he will put the councilman in the design show. He means it. He already did it to the last one.',
    );
    d({
      id: "ues_streamliner",
      type: "misc",
      name: "Streamliner Locomotive Model",
      weight: 3,
      value: 450,
      tags: ["valuable"],
      desc: "A chrome 1938 streamliner in 1:24 scale, nose like a bullet, every rivet painted. The museum card is still tied to the coupler.",
    });

    // ---- Gracie Mansion ----
    note(
      "ues_note_gracie_minutes",
      "Council Minutes",
      'GRACIE MANSION TOWN COUNCIL — MINUTES\n\n1. Water purifier: running. Thank the Abernethy twins.\n2. Raiders at the Carnegie place took Councilman Pettibone. Motion to pay: tabled. Motion to stop calling it "the Carnegie place": passed.\n3. Treasury: the safe combination is changed after the theft. New combination 6-2-4-8, known to the Mayor and the Treasurer only. (The Secretary is writing it down because the Treasurer cannot remember anything. Burn these minutes.)\n4. Election in the Ballroom on Sunday. One voting machine still works. Bring a pencil anyway.',
      { learn: "ues_gracie_treasury" },
    );
    tape(
      "ues_reel_gracie_1967",
      "Tape Reel: Mayor's Address, March 1967",
      '"—citizens of New York. I am speaking to you from Gracie Mansion. The reports you have heard are true. Whatever you were told to expect, it was not the Soviets. I repeat: the attack came from across the Atlantic. Stay off the bridges. Go below ground. City Hall will—" [The tape hisses for a long time.]',
    );

    // ---- Park Avenue Armory ----
    note(
      "ues_note_armory_orders",
      "Standing Orders — The Seventh",
      "STANDING ORDERS, BY COMMAND OF MAJOR CALLOWAY\n\n1. The Drill Hall belongs to the Seventh. Anyone who walks in without paying pays twice.\n2. The art is not for sale. The art is for being admired by me.\n3. The armoury cage key stays on my desk. Anyone who moves it cleans the latrines until the next war.\n4. My footlocker is mine. It opens on 0-7-1-7 and I will know if you try it.\n5. The voting machine stays where it is. We may need to win an election.",
      { learn: "ues_armory_footlocker" },
    );
    tape(
      "ues_reel_armory_1977",
      "Tape Reel: Regimental Reunion, 1977",
      '[Glasses clink. Old men singing, badly.]\n\n"—ten years since, and here we are, gentlemen, in our own hall, and the hall still standing! To the Seventh! To the ones who stayed on the bridge!" [A cheer. Someone drops a tray. Laughter.] "Somebody wind that tape back, I want to hear Harry sing it again."',
    );
    note(
      "ues_note_armory_moss",
      "Letter Home",
      "Ma —\n\nThe Major says we are a regiment now. We have a flag and everything. Mostly we sit on the sandbags and shoot at whoever comes up Park Avenue. Yesterday it was a man with a pack ox who only wanted to sell us cabbages. Callahan shot the ox. I bought the cabbages. I don't think I am cut out for this.\n\n— Danny Moss",
    );
    d({
      id: "ues_voting_machine",
      type: "misc",
      name: "Lever Voting Machine Panel",
      weight: 6,
      value: 220,
      tags: ["valuable"],
      desc: "The front panel of a 1960s lever voting machine, every lever pulled to the same candidate. A small brass plate reads BOARD OF ELECTIONS, CITY OF NEW YORK.",
    });
    d({
      id: "ues_painting_francis",
      type: "misc",
      name: "Rolled Canvas (St. Francis)",
      weight: 2,
      value: 850,
      tags: ["valuable", "art"],
      desc: "A monk in a rocky desert, arms open to a light from the upper left. Cut from its frame with a bayonet. It belongs back on the empty wall of the Frick's Living Hall.",
    });
    d({
      id: "ues_key_armory_cage",
      type: "key",
      name: "Armoury Cage Key",
      weight: 0,
      value: 0,
      noLoot: true,
      tags: ["key"],
      mesh: "key",
      desc: "A long brass key on a regimental lanyard, stamped VII — ARMOURY.",
    });
  }

  // ------------------------------------------------------------------
  // Teletype terminals
  // ------------------------------------------------------------------
  function defineTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    const T = (id, def) =>
      P.safe("term:" + id, () => G.terminals.register(id, def));
    T("ues_frick_catalog", {
      title: "THE FRICK COLLECTION — CATALOGUE",
      header: "MERIDIAN TELETYPE CO. — TELELINK\nCollection Records",
      entries: [
        {
          title: "West Gallery — Status",
          text: 'ITEMS ON VIEW: 41.\nITEMS MISSING: 2 — "Mistress and Maid" (Vermeer); "St. Francis in the Desert" (Bellini).\nNOTE: the attendant units report the Vermeer is "resting in storage". The Bellini was removed by persons unknown, with guns.',
        },
        {
          title: "Attendant Units — Directive",
          text: "ATTENDANT UNITS 1-6: guide visitors. Remove visitors who touch. The collection closes at 5 P.M. The collection is now always closing.",
        },
      ],
    });
    T("ues_frick_security", {
      title: "FRICK — SECURITY OFFICE",
      header: "MERIDIAN TELETYPE CO. — TELELINK\nNight Watch",
      entries: [
        {
          title: "Night Log",
          text: 'MAR 4 1967 23:40 — All quiet. The butler is still polishing silver.\nMAR 5 1967 09:46 — Air-raid sirens. Sunday staff dismissed. Attendant units ordered to "carry on".\nMAR 5 1967 09:47 — They are carrying on.',
        },
        {
          title: "Safe Register",
          learn: "ues_frick_safe",
          text: "MR. FRICK'S WALL SAFE (house silver, Mr. Frick's letters).\nCombination: the year the house was finished — 1914. Change it? The butler says no.",
        },
      ],
    });
    T("ues_coop_decorator", {
      title: "THE DECORATOR'S DESK",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK\nCooper-Hewitt Office of Exhibitions (requisitioned)",
      entries: [
        {
          title: "Show Notes",
          text: "THE SHOW NEEDS MORE CHROME.\nTHE SHOW NEEDS A CENTREPIECE.\nThe councilman from Gracie will do. Pose him like the toaster. People love the toaster.",
        },
        {
          title: "Prisoner Ledger",
          text: "Cage, coal cellar: 1 councilman (Pettibone). Ransom asked: 300 scrip. Ransom paid: 0. Councilman fed: Tuesdays.",
        },
      ],
    });
    T("ues_gracie_mayor", {
      title: "OFFICE OF THE MAYOR — GRACIE MANSION",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK\nCity of New York (what is left of it)",
      entries: [
        {
          title: "Proclamation",
          text: "BY ORDER OF THE MAYOR OF GRACIE MANSION: everyone inside the palisade is a citizen. Citizens get water. Citizens vote. Citizens do not keep pack oxen in the Ballroom.",
        },
        {
          title: "Treasury Note",
          learn: "ues_gracie_treasury",
          text: "Treasurer: the combination is 6248 since the theft. Please stop asking me. — The Mayor",
        },
      ],
    });
    T("ues_gracie_rolls", {
      title: "VOTER ROLLS",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK\nBoard of Elections, Precinct 1 (Gracie)",
      entries: [
        {
          title: "Registered Voters",
          text: "112 registered. 97 present at last count. 3 voted twice (disqualified). 1 pack ox registered as a joke (disqualified, after debate).",
        },
      ],
    });
    T("ues_armory_orders", {
      title: "THE SEVENTH — ORDERLY ROOM",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK\nSeventh Regiment (self-appointed)",
      entries: [
        {
          title: "Duty Roster",
          text: "GATE: Moss, Ferrante. DRILL HALL: everybody else. ART: the Major.\nPUNISHMENT DETAIL: whoever ate the Major's peaches.",
        },
        {
          title: "Major's Memo",
          text: "The Frick wants its saint back. The Frick can come and get it. — C.",
        },
      ],
    });
    T("ues_armory_range", {
      title: "RIFLE RANGE — RANGE OFFICE",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK\nSeventh Regiment Armory, Basement",
      entries: [
        {
          title: "Range Rules",
          text: "1. Point it downrange.\n2. No live rounds at the targets with faces on them.\n3. The faces are of the Major. See rule 2.",
        },
        {
          title: "Quartermaster's Note",
          learn: "ues_armory_safe",
          text: "The regimental safe upstairs still opens on the year the regiment was raised: 1806. The Major thinks only he knows it. Every quartermaster since 1806 has known it.",
        },
      ],
    });
  }

  P.addBuilder(
    "ues_content",
    () => {
      P.safe("items", defineItems);
      P.safe("terminals", defineTerminals);
    },
    1,
  );
})();
