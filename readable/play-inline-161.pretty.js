/* src/poi_uptown/80_content_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 80 content
 * Items, notes & tape reels, terminals, dialogue, named NPCs, quests and
 * the scripted set pieces of the five uptown POIs:
 *
 *  QUESTS
 *   pu_encore    "Lullaby for Ada" (Maestro Bell, Carnegie Hall) — the Consort's
 *                first concert in twenty-two years needs: the lost score
 *                from the Dakota, power for the stage dynamo (the Hayden
 *                planetarium's projector cell) and the Plaza Society's
 *                patronage (the Atlas Diamond from Tiffany's vault, a
 *                Persuasion check, or a fat subscription). Install the cell,
 *                take a seat, enjoy the show.
 *   pu_nursery   "The Crying in 3B" (Agnes Hollister, the Dakota) — the key
 *                in the basement, the sealed Hollis apartment, Nanny.
 *   pu_heist     "The Great Tiffany Heist" — into the vault (the Raider
 *                Boss's key, or the security time-lock override).
 *   pu_omelette  "Omelette des Ruines" (Chef Gaston, the Plaza) — a
 *                ripjaw egg from the AMNH matriarch's nest.
 *  SET PIECES
 *   AMNH star show (planetarium terminal) · removable projector cell ·
 *   Dakota sealed door + crying · Plaza Suite 610 rental + Presidential
 *   Suite lock · Carnegie dynamo + concert (radio "Classical NYC" from the
 *   stage, lights) · Tiffany electrified flood + breaker, vault door.
 * All text original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];
  P.tick = P.tick || [];

  // ------------------------------------------------------------------
  // locks (read by the site builders in init). Every unlock is placed in this module:
  //   pu_dakota_3b        key pu_key_hollis (Superintendent's Desk, Dakota basement office)
  //   pu_dakota_pell_safe code 0412 (the Pell place card, 2B dining room)
  //   pu_amnh_star_safe   code 4117 (the projectionist's tape reel, Hayden booth)
  //   pu_amnh_collections passcode UNGUIS (Curator Halvorsen's memo)
  //   pu_plaza_pres       code 1907 (the Plaza front-desk teletype)
  //   pu_plaza_pres_safe  code 2215 (Winifred's letter on hotel stationery, Presidential Suite)
  //   pu_tiffany_watch    code 1837 (Tiffany security teletype)
  //   pu_tiffany_box_1238 code 4417 (Tiffany security teletype)
  //   pu_tiffany_security passcode MOSLER (Walt the night watchman's note)
  //   pu_tiffany_vault    key pu_key_tiffany_vault (the Raider Boss) — or the time-lock override on the security teletype
  // ------------------------------------------------------------------
  P.LOCKS = {
    dakota_3b: {
      id: "pu_dakota_3b",
      label: "Apartment 3B — Hollis",
      kind: "door",
      key: "pu_key_hollis",
      hint: "The superintendent kept the key in his desk.",
    },
    pell_safe: {
      id: "pu_dakota_pell_safe",
      label: "Pell Family Safe",
      kind: "safe",
      code: "0412",
      hint: "The place card on the Pell dining table.",
    },
    star_safe: {
      id: "pu_amnh_star_safe",
      label: "Planetarium Safe",
      kind: "safe",
      code: "4117",
      hint: "The projectionist's tape reel in the Hayden booth.",
    },
    collections: {
      id: "pu_amnh_collections",
      label: "AMNH Collections Teletype",
      kind: "terminal",
      passcode: "UNGUIS",
      hint: "Curator Halvorsen's memo.",
    },
    pres_door: {
      id: "pu_plaza_pres",
      label: "Presidential Suite",
      kind: "door",
      code: "1907",
      hint: "The Plaza front-desk teletype.",
    },
    pres_safe: {
      id: "pu_plaza_pres_safe",
      label: "Presidential Suite Safe",
      kind: "safe",
      code: "2215",
      hint: "Winifred's letter on hotel stationery, in the suite.",
    },
    watch_safe: {
      id: "pu_tiffany_watch",
      label: "Watch Department Safe",
      kind: "safe",
      code: "1837",
      hint: "The Tiffany security teletype.",
    },
    deposit_1238: {
      id: "pu_tiffany_box_1238",
      label: "Safety Deposit Box 1238",
      kind: "safe",
      code: "4417",
      hint: "The Tiffany security teletype.",
    },
    security: {
      id: "pu_tiffany_security",
      label: "Tiffany Security Teletype",
      kind: "terminal",
      passcode: "MOSLER",
      hint: "Walt the night watchman's note.",
    },
    vault: {
      id: "pu_tiffany_vault",
      label: "Tiffany Vault Door",
      kind: "door",
      key: "pu_key_tiffany_vault",
      hint: "The Raider Boss wears the key; the security teletype can also release the time lock.",
      keyFrom: "NPC: the Tiffany Raider Boss (carries the key)",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);

  // ------------------------------------------------------------------
  // persistent state (own save block: G.save 'poi_uptown' → content)
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    showRuns: 0,
    cellTaken: false,
    hollisOpen: false,
    presOpen: false,
    vaultOpen: false,
    timelock: false,
    breakerOff: false,
    rented: false,
    dynamoOn: false,
    concertDone: false,
    patron: false,
    scoreGiven: false,
    powerGiven: false,
    nanny: null,
    agnesMet: false,
    cryHeard: false,
    eggGiven: false,
    heistStarted: false,
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
  const give = (id, n, silent) => {
    try {
      if (G.isStub("inventory")) return;
      if (id === "scrip" && G.inventory.addScrip) G.inventory.addScrip(n);
      else G.inventory.add(id, n || 1, silent ? { silent: true } : undefined);
    } catch (e) {
      G.reportError("poi_uptown:give", e);
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
  const scrip = () => {
    try {
      return G.isStub("inventory")
        ? 0
        : G.inventory.scrip
          ? G.inventory.scrip()
          : G.inventory.count("scrip");
    } catch (e) {
      return 0;
    }
  };
  const pay = (n) => {
    if (scrip() < n) {
      G.notify("You don't have enough scrip.");
      G.sfx.play("ui_error");
      return false;
    }
    give("scrip", -n);
    if (!G.inventory.addScrip) take("scrip", n);
    G.sfx.play("barter_trade");
    return true;
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
    if (q) P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => (st ? q.setStage(id, st) : q.start(id)));
  };
  const qComplete = (id) => {
    const q = Q();
    if (q) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
  C.helpers = {
    has,
    give,
    take,
    pay,
    xp,
    standing,
    qStage,
    qActive,
    qDone,
    qSet,
    qStart,
    actor,
    A,
  };

  // ==================================================================
  // ITEMS
  // ==================================================================
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "note",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["note"],
          },
          extra || {},
        ),
      );
    const tape = (id, name, title, text, extra) =>
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
    // AMNH
    note(
      "pu_note_worksheet",
      "Field Trip Worksheet",
      "P.S. 87 — Museum Field Trip — Grade 4",
      'NAME: Timmy K.\n\n1. How tall is the Barosaurus?  "Taller than Dad\'s bomb shelter."\n2. What did dinosaurs eat?  "Other dinosaurs and Communists."\n' +
        '3. Why did the dinosaurs go extinct?  "Mrs. Albright says a big rock. Billy says atomic war. Billy is going to the principal."\n4. Draw your favorite exhibit:\n' +
        "[A crayon drawing of something with long horns and very long claws. Labelled: RIPJAW (REAL). Gold star.]",
    );
    tape(
      "pu_reel_akeley",
      'Tape reel: "Akeley Expedition, Reel 3"',
      "Narration track — Hall of African Mammals, 1956 re-edit",
      '[Crackling orchestral swell] "...and here, in the shadow of the Mountains of the Moon, the explorer pauses to consider his quarry. For Man, alone among the ' +
        "beasts, hunts not from hunger but from curiosity...\" [a second, much later voice cuts in] \"Curiosity's why I'm in here, pal. Lions in the glass didn't " +
        "move. Lion that came up the stairs did. Kept the hat, though. Hat's a good hat.\"",
    );
    note(
      "pu_note_halvorsen",
      "Curator Halvorsen's Memo",
      "INTERNAL — Dept. of Vertebrate Paleontology",
      'Re: specimen DC-77 ("Unguis mortis"), on loan from the Tonopah Research Station.\n\nI have now been told three times that it is a CAST. Casts do not arrive in a ' +
        "refrigerated crate stamped KESSLER-HAAS. Casts do not have soft tissue. And casts, gentlemen, do not lay eggs.\n\nThe three objects found in the Dinosaur Hall " +
        'on Tuesday have been placed in the incubator "for safekeeping" on the orders of a Mr. Grayson of the Department of Defense, who also asked me to stop ' +
        "writing memos.\n\nThis is a memo. And Mr. Grayson may whistle for my teletype password. (It is UNGUIS. Nobody reads memos.) — E. Halvorsen",
      { learn: "pu_amnh_collections" },
    );
    note(
      "pu_note_ocean",
      "Maintenance Request #7741",
      "Buildings & Grounds — Milstein Hall",
      "Sump pump #2 in Ocean Life has failed AGAIN. Water on the lower floor, and it's glowing. Mr. Pruitt says that's the new \"ambient lighting\". It is not " +
        "ambient lighting. Please send a plumber, a Geiger counter, and possibly a priest.",
    );
    tape(
      "pu_reel_projectionist",
      "Tape reel: Projectionist's Log",
      "Hayden Planetarium — Projection Booth",
      '"Show 4,117. Standing room only — never seen the like. Everybody wants to see the stars before the Reds take them away. Old Zeiss is running hot, so I ' +
        "put in the Mark IV cell from the Army lot. Runs forever, those things. Twenty-two years, the salesman said. I laughed.\n\n[sirens, distant] ...Folks " +
        "are asking if they can stay for the next show. Sure. Sure, you can all stay. I'll dim the house lights. The box office takings are in the booth safe — " +
        "combination's the show number, four-one-one-seven, so I can't forget it.\"",
      { learn: "pu_amnh_star_safe" },
    );
    d({
      id: "pu_star_chart",
      type: "misc",
      name: "Hayden Star Chart (1967)",
      weight: 0.1,
      value: 60,
      mesh: "paper",
      tags: ["valuable"],
      desc: "A gilt-edged planisphere of the New York sky, March 1967. Collectors still pay for proof the sky used to be blue.",
    });
    d({
      id: "pu_pith_helmet",
      type: "apparel",
      slot: "head",
      name: "Explorer's Pith Helmet",
      weight: 1,
      value: 90,
      dr: 3,
      attrs: { senses: 1 },
      skills: { survival: 5 },
      mesh: "helmet_army",
      tags: ["apparel", "hat", "unique"],
      desc: "Cork, khaki and a hundred and fifty years of Manhattan dust. Once belonged to a man who shot elephants for science.",
    });
    d({
      id: "pu_ripjaw_egg",
      type: "aid",
      name: "Ripjaw Egg",
      weight: 2,
      value: 120,
      mesh: "ball",
      sound: "eat",
      tags: ["food", "raw", "rare"],
      effects: { hpOverTime: [45, 8], rads: 8 },
      desc: "Leathery, warm, and faintly ticking. Chef Gaston at the Plaza would give his whisk for one.",
    });
    d({
      id: "pu_planetarium_cell",
      type: "misc",
      name: "Planetarium Power Cell (Mark IV)",
      weight: 4,
      value: 250,
      mesh: "battery",
      quest: true,
      tags: ["quest"],
      desc: "An Army-surplus Mark IV cell pulled from the Hayden star projector. Still humming after two decades. The stars went out when you took it.",
    });
    // Dakota
    d({
      id: "pu_key_hollis",
      type: "key",
      name: "Hollis Apartment Key",
      weight: 0,
      value: 0,
      mesh: "key",
      noLoot: true,
      tags: ["key"],
      desc: 'A heavy brass key on a tag: "3B — HOLLIS — DO NOT ISSUE".',
    });
    note(
      "pu_note_super",
      "Superintendent's Note",
      "Tacked above the key board",
      "RUIZ — The board says 3B stays SEALED. I don't care what you hear at night. It's the pipes. Pipes don't sing lullabies? These ones do. KEY STAYS IN MY DESK.\n\n" +
        "P.S. Boiler's leaking something green again. If I start glowing, I quit.",
    );
    note(
      "pu_note_concierge",
      "Concierge's Log Book",
      "The Dakota — Front Desk, March 1967",
      'Mar 3 — Mr. Hollis (3B) away on tour. Mrs. Hollis indisposed. Nursery unit ("Nanny") complaining of "insufficient bedtime stories" to the elevator.\n' +
        "Mar 4 — Mrs. Hollister (3A) reports singing through the wall. Very pretty. Not a complaint, she says.\nMar 5 — Sirens. Board votes to seal the building. " +
        'Nobody in, nobody out. Mrs. Hollis did not answer the door. Nanny answered for her. "The baby is sleeping. Please use your indoor voice."',
    );
    note(
      "pu_note_dinner",
      "Place Card",
      "The Pell Breakfast — Sunday, March 5th",
      'Menu: Eggs Benedict · Kedgeree · Champagne Cocktails\n\nSeating: Mr. & Mrs. Pell · the Van Rensselaers · Dr. Abernathy\n\nOn the back, in pencil: "Howard says if ' +
        'we just keep eating, the sirens will stop. Howard has always been an idiot. Pass the salt."\n\nUnderneath, in Howard\'s hand: "Safe is my birthday, dear. ' +
        'Oh-four-twelve. Get the bonds out if they come."',
      { learn: "pu_dakota_pell_safe" },
    );
    d({
      id: "pu_score",
      type: "misc",
      name: '"Lullaby for Ada" (Manuscript Score)',
      weight: 0.5,
      value: 40,
      mesh: "book",
      quest: true,
      tags: ["quest"],
      desc: 'Julius Hollis\'s only completed symphony, in his own hand, a lullaby written for his newborn daughter. The last page is annotated: "For the first night of the new world."',
    });
    tape(
      "pu_reel_hollis1",
      'Tape reel: "For Ada, Movement I"',
      "J. Hollis — composer's sketch",
      "[piano, a gentle four-note figure, repeated] \"Ada. That's the theme. Four notes, like your name, if your name were a bit longer. When you're old enough, the " +
        'Philharmonic will play it at Carnegie Hall and you\'ll be terribly embarrassed. That\'s what fathers are for." [a baby gurgles] "See? She agrees."',
    );
    tape(
      "pu_reel_hollis2",
      'Tape reel: "Nanny — Standing Orders"',
      "American Automaton Tot-Minder unit — owner programming",
      "\"Nanny, this is Margaret Hollis. Standing orders: if anything happens — anything — you keep Ada calm. You sing to her. You don't stop singing until she's " +
        'grown. Do you understand?"\n\nNANNY: "Understood, Mrs. Hollis. I will not stop singing until Ada is grown."\n\n"...Good. Good girl. I\'m going to lie down for a bit."',
    );
    d({
      id: "pu_hollis_locket",
      type: "misc",
      name: "Hollis Family Locket",
      weight: 0.1,
      value: 150,
      mesh: "tag",
      tags: ["valuable"],
      desc: "A gold locket. Inside: a man at a piano, a woman laughing, and a very small, very bald baby.",
    });
    // Plaza
    note(
      "pu_note_guest",
      "Hotel Stationery",
      "THE PLAZA — Fifth Avenue at Central Park South",
      'Dearest Mother — The hotel is marvellous. They have announced that the "situation" will not affect the Sunday brunch. The orchestra is playing. Everybody is ' +
        "dancing. I have decided that if the world is ending I shall be found in my good pearls. Do not wait up. — Winifred\n\n" +
        "P.S. Daddy's suite safe is 2-2-1-5, should anyone need the bonds. I shan't.",
      { learn: "pu_plaza_pres_safe" },
    );
    d({
      id: "pu_society_charter",
      type: "note",
      name: "Charter of the Plaza Society",
      title: "CHARTER OF THE PLAZA SOCIETY (Revised, 1981)",
      weight: 0,
      value: 0,
      tags: ["note"],
      text:
        'ARTICLE I. The War is to be referred to only as "the Unpleasantness".\nARTICLE II. Dinner is at eight. Radiation is no excuse for lateness.\n' +
        "ARTICLE III. Members shall dress for dinner. Exo-rig is not formal wear, regardless of polish.\nARTICLE IV. Persons of no fixed address may be admitted, provided they are " +
        "old money.\nARTICLE V. The Society shall maintain the Last Cotillion in perpetuity, or until the band returns, whichever comes first.",
    });
    d({
      id: "pu_key_suite",
      type: "key",
      name: "Plaza Suite 610 Key",
      weight: 0,
      value: 0,
      mesh: "key",
      noLoot: true,
      tags: ["key"],
      desc: "A brass key on a velvet tassel. The tag reads 610.",
    });
    // Carnegie
    note(
      "pu_note_bell",
      "Programme Notes",
      "The Carnegie Consort — Opening Night (draft)",
      'PROGRAMME: Hollis — Symphony No. 1, "Lullaby for Ada" (world premiere, 22 years late)\n\nNEEDS:\n  1. The score (Hollis lived at the Dakota. The Dakota ' +
        "is... the Dakota.)\n  2. POWER. Dynamo No. 2 wants a cell. A real one. Not a potato and two wires, Rudy.\n  3. An audience with money. The Plaza lot have " +
        "money and nothing to do with it. Pride, too. Use it.\n\n— I.B.",
    );
    d({
      id: "pu_maestro_tails",
      type: "apparel",
      slot: "body",
      name: "Maestro's Tails",
      weight: 2,
      value: 180,
      dr: 2,
      attrs: { presence: 2 },
      skills: { persuasion: 10 },
      outfit: "merchant",
      mesh: "cloth_black",
      tags: ["apparel", "clothing", "old_world", "unique"],
      desc: "Maestro Bell's second-best tailcoat, presented after the Consort's first concert in two decades. The lapels still smell faintly of rosin and applause.",
    });
    // Tiffany
    d({
      id: "pu_tiffany_ring",
      type: "misc",
      name: "Tiffany Engagement Ring",
      weight: 0.05,
      value: 180,
      mesh: "tag",
      tags: ["valuable"],
      desc: "Platinum, one carat, in a little blue box. Someone was going to ask a very important question.",
    });
    d({
      id: "pu_diamond_chip",
      type: "misc",
      name: "Loose Diamond",
      weight: 0.01,
      value: 75,
      mesh: "tag",
      tags: ["valuable"],
      desc: "A cut stone, pried from its setting by somebody in a hurry.",
    });
    d({
      id: "pu_atlas_diamond",
      type: "misc",
      name: "The Atlas Diamond",
      weight: 0.2,
      value: 2500,
      mesh: "statuette",
      tags: ["valuable", "unique"],
      desc: 'A canary-yellow diamond the size of a Fizzo Cola cap, cut into ninety facets. Old-world insurers valued it at "don\'t even ask". Lady Constance at the Plaza would sell her own mother for it. Several times.',
    });
    d({
      id: "pu_key_tiffany_vault",
      type: "key",
      name: "Tiffany Vault Key",
      weight: 0,
      value: 0,
      mesh: "key",
      noLoot: true,
      tags: ["key"],
      desc: "A long steel key with a Mosler tag. The Raider Boss wore it on a chain like a medal.",
    });
    note(
      "pu_note_guard",
      "Night Watchman's Note",
      "Tiffany & Co. — Security",
      'Sarge — the Kowalski boys came in "to buy a ring" at 9:40 with duffel bags and no mother. The sirens went at 9:46. At 9:47 the time lock fired on its own and ' +
        "shut the vault with them inside. I figure they're safer in there than we are out here.\n\nOverride for the time lock is on the security teletype (password MOSLER, same as always). I'm not " +
        "opening it. Let 'em have the diamond. — Walt",
      { learn: "pu_tiffany_security" },
    );
    tape(
      "pu_reel_heist",
      'Tape reel: "Heist Crew, 5 Mar"',
      "Recorded inside the Tiffany vault",
      "\"Okay. Okay okay okay. Vault shut itself. That's fine. Time lock opens at nine tomorrow. Monday. We just wait. [muffled boom] ...That was a big truck. " +
        "[second boom, bigger] That was a very big truck.\n\nEddie says we split the Atlas three ways. I say we're rich. Frankie says we're dead. Frankie's " +
        'always so negative."',
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
    T("pu_amnh_security", {
      title: "AMNH SECURITY — ROTUNDA DESK",
      header: "AMERICAN MUSEUM OF NATURAL HISTORY\nVisitor Services Telelink",
      entries: [
        {
          title: "Evacuation Order (03/05/67)",
          text: "ALL VISITORS TO THE NEAREST PUBLIC SHELTER (SUBWAY, 81ST STREET).\nSTAFF: close the dioramas, cover the Barosaurus, do NOT let the school group into the Dinosaur Hall. Do not ask why.",
        },
        {
          title: "Night Log — Guard Pruitt",
          text: "02:10 Noises in Dinosaur Hall. Checked. Nothing.\n02:40 Noises in Dinosaur Hall. Checked. Something.\n02:41 Requesting transfer to Minerals & Gems.\n02:43 Requesting transfer to literally anywhere else.",
        },
        {
          title: "Exhibit Status Board",
          text: 'Roosevelt Rotunda ........ OPEN\nAkeley Hall ............... OPEN (dioramas 3, 5 cracked)\nHall of Dinosaurs ......... CLOSED (DC-77 "incident")\nOcean Life ................ FLOODED\nHayden Planetarium ........ SHOWS HOURLY — "The Sky Over Manhattan"',
        },
      ],
    });
    T("pu_amnh_collections", {
      title: "COLLECTIONS MANAGEMENT",
      header: "AMNH — Dept. of Vertebrate Paleontology\nAuthorized Personnel",
      lock: P.LOCKS.collections,
      entries: [
        {
          title: "Accession DC-77",
          text: 'SPECIMEN: "Unguis mortis" (provisional)\nSOURCE: Tonopah Research Station / Kessler-Haas (via DoD)\nCONDITION: excellent. Too excellent.\nNOTES: mounted as a "cast" per DoD instructions. Mount keeps being found in a different pose in the mornings.',
        },
        {
          title: "Memo: Eggs",
          text: 'Three ovoid objects recovered beneath the DC-77 mount. Warm to the touch. DoD requests incubation "for study". Curator Halvorsen requests an explanation. DoD requests Curator Halvorsen.',
        },
        {
          title: "Halvorsen — last entry",
          text: "They hatched on the 4th. I let the first one go. I didn't know what else to do — it looked at me the way the Barosaurus mother looks at the Allosaurus. Tell the school groups the hall is closed for renovation. Tell them anything.",
        },
      ],
    });
    T("pu_amnh_planetarium", {
      title: "HAYDEN PLANETARIUM — SHOW CONTROL",
      header: "ZEISS MARK VI PROJECTOR CONTROL\nMeridian Telelink 2.1",
      entries: [
        {
          title: 'RUN SHOW: "The Sky Over Manhattan"',
          text: () =>
            P.amnhShow && P.amnhShow.powered
              ? "Show loaded. Dimming house lights..."
              : "ERROR: projector has no power cell.",
          action: () => {
            if (P.amnhShow && P.amnhShow.powered) {
              C.startStarShow();
              return "Show running. Please take your seats.";
            }
            return "ERROR: projector has no power cell.";
          },
        },
        {
          title: "Projector Status",
          text: () =>
            P.amnhShow && P.amnhShow.powered
              ? "Lamp: OK\nStar field: 8,900 stars\nPower: Mark IV cell, 61% (installed 03/02/67)\nNOTE: cell housing may be released manually at the projector base."
              : "POWER: NONE\nThe cell housing stands open and empty.",
        },
        {
          title: "Show Log",
          text: "Show 4,117 — 03/05/67 09:30 — audience: 412 — status: RUNNING\nShow 4,117 — status: RUNNING\nShow 4,117 — status: RUNNING\n[the same line repeats for several thousand pages]",
        },
      ],
    });
    T("pu_dakota_super", {
      title: "THE DAKOTA — BUILDING MANAGEMENT",
      header: "Superintendent's Office — M. Ruiz",
      lock: 0,
      entries: [
        {
          title: "Work Orders",
          text: "3A (Hollister): \"singing in the walls\" — NOT PIPES. Closed.\n2B (Pell): breakfast party noise — ongoing since 3/5.\nBoiler: leaking green. Wear gloves. Or don't, it's your funeral.",
        },
        {
          title: "RE: 3B (Hollis) — SEALED",
          text: 'By order of the Board: apartment 3B is sealed until further notice. The tenant\'s robot refuses entry "during nap time". Nap time has now lasted six days. Door boarded. Key in my desk. Do NOT issue it.',
        },
        {
          title: "Key Cabinet Inventory",
          text: "All keys present except: 2A (Van Rensselaer — eaten?), 4C (lost), and the Board's patience.\n3B key: DESK DRAWER, top left.",
        },
      ],
    });
    T("pu_plaza_front", {
      title: "THE PLAZA — FRONT DESK",
      header: "THE PLAZA HOTEL · FIFTH AVENUE\nGuest Services Telelink",
      entries: [
        {
          title: "Room Rates",
          text: "Suite 610 (four-poster, park view, working bath*): 40 scrip the night.\n*bath works in the sense that it holds you.\nPresidential Suite: not available. Key lost in 1967. Staff still looking.",
        },
        {
          title: "Presidential Suite — Keypad",
          learn: "pu_plaza_pres",
          text: "The brass keypad on the Presidential doors answers to the year the hotel opened: 1907.\nThe Society has asked that nobody use it. Nobody has asked the Society.",
        },
        {
          title: "Guest Register (current)",
          text: 'Lady C. Vane-Worthington — permanent\nCol. R. Ashby (ret.) — permanent\nMrs. P. Pennington-Smythe — permanent\nMiss "Bunny" Fairchild — permanent\nGuests of the Society — see Pemberton',
        },
        {
          title: "Society Bylaws (excerpt)",
          text: 'The War is to be referred to only as "the Unpleasantness". Dinner is at eight. Radiation is no excuse for lateness.',
        },
      ],
    });
    T("pu_carnegie_stage", {
      title: "CARNEGIE HALL — STAGE MANAGEMENT",
      header: "Stern Auditorium · Stage Door Telelink",
      entries: [
        {
          title: "Stage Manager's Log",
          text: '03/05/67 — Philharmonic dress rehearsal cancelled. Orchestra refuses to leave the building ("the acoustics are better than the subway"). Stage manager agrees.',
        },
        {
          title: "Dynamo No. 2 Status",
          text: () =>
            F.dynamoOn
              ? "DYNAMO No. 2: RUNNING\nStage lighting: ON\nOrgan blower: ON\nHouse: READY"
              : "DYNAMO No. 2: OFFLINE\nRequires: power cell, Mark III or better, or a very small sun.",
        },
        {
          title: "Programme: Symphony No. 1",
          text: 'J. HOLLIS — Symphony No. 1 in C, "Lullaby for Ada"\nWorld premiere scheduled 11/1/67. Score held by the composer (the Dakota, 3B).',
        },
      ],
    });
    T("pu_tiffany_security", {
      title: "TIFFANY & CO. — SECURITY",
      header: "MOSLER VAULT SYSTEMS\nTime Lock Controller",
      lock: P.LOCKS.security,
      entries: [
        {
          title: "Watch Department Safe",
          learn: ["pu_tiffany_watch", "pu_tiffany_box_1238"],
          text: "Second-floor watch safe: combination 1837, the year of the founding. Change it, Sal. — Management\nVault deposit box 1238 (house box): keypad 4417.",
        },
        {
          title: "Time Lock Status",
          text: () =>
            F.vaultOpen
              ? "VAULT DOOR: OPEN"
              : F.timelock
                ? "TIME LOCK: DISENGAGED — door released"
                : "TIME LOCK: ENGAGED (fired 03/05/67 09:47, emergency)\nNext scheduled opening: 03/06/67 09:00",
        },
        {
          title: "DISENGAGE TIME LOCK",
          cond: () => !F.timelock && !F.vaultOpen,
          text: "Override accepted.",
          action: () => {
            F.timelock = true;
            P.safe("unlock", () => {
              if (P.locksLive()) G.locks.unlock(P.LOCKS.vault.id);
            });
            C.openVault(true);
            return "Override accepted. Bolts retracting... (the vault door rumbles in the basement)";
          },
        },
        {
          title: "Guard Rotation",
          text: 'Walt (nights) — Sal (days) — Kowalski brothers (NOT staff, do not let them "help")',
        },
      ],
    });
  }

  // ==================================================================
  // DIALOGUE
  // ==================================================================
  function defineDialogue() {
    if (G.isStub("dialogue") || typeof G.dialogue.register !== "function")
      return;
    const R = (id, tree) =>
      P.safe("dlg:" + id, () => G.dialogue.register(id, tree));
    const gatherLeft = () =>
      [
        !(F.scoreGiven || has("pu_score")),
        !(F.powerGiven || has("pu_planetarium_cell") || has("dry_cell", 3)),
        !F.patron,
      ].filter(Boolean).length;
    // ---------------- Maestro Bell ----------------
    R("dlg_pu_bell", {
      start: () =>
        qDone("pu_encore")
          ? "after"
          : qStage("pu_encore") === "deliver"
            ? "deliver"
            : qStage("pu_encore") === "dynamo"
              ? "dynamo"
              : qStage("pu_encore") === "concert"
                ? "concert"
                : qActive("pu_encore")
                  ? "progress"
                  : "first",
      nodes: {
        first: {
          speaker: "Maestro Bell",
          text: "Ah — a listener! No, don't tell me: you've come for the music. Everybody comes for the music eventually. I am Ignatius Bell, conductor of the Carnegie Consort, and you are standing in the finest acoustic space left on this ruined planet.",
          responses: [
            { text: "The Carnegie Consort?", next: "consort" },
            {
              text: "Why is a conductor living in a burned-out concert hall?",
              next: "why",
            },
            { text: "Just passing through.", end: true },
          ],
        },
        consort: {
          speaker: "Maestro Bell",
          text: "Nine musicians, one stagehand robot, and a piano player who has been practising the same Chopin étude since the Johnson administration. We play every night. To the rats, mostly. But we are planning something... larger.",
          responses: [{ text: "Larger how?", next: "plan" }],
        },
        why: {
          speaker: "Maestro Bell",
          text: "Because on the fifth of March, 1967, the New York Philharmonic refused to leave this building, on the grounds that the acoustics were better than the subway. They were right. Three of them are still in my orchestra. Their children are the rest.",
          responses: [{ text: "So what are you planning?", next: "plan" }],
        },
        plan: {
          speaker: "Maestro Bell",
          text: 'A premiere! Julius Hollis\'s Symphony No. 1 — "Lullaby for Ada" — scheduled for November 1967 and cancelled on account of the end of the world. Twenty-two years late. I intend to be on time for once. But I need three things, and I cannot fetch them with a baton.',
          responses: [
            { text: "What do you need?", next: "needs" },
            { text: "Not my problem.", end: true },
          ],
        },
        needs: {
          speaker: "Maestro Bell",
          text: "One: the score. Hollis lived at the Dakota, and the Dakota is... haunted, frankly. Two: power. Stage dynamo number two wants a real cell — I'm told the old Hayden Planetarium ran its projector on an Army one. Three: an audience with standing. The Plaza Society. Rich, idle, and desperate to be seen at something. Win them over and the whole uptown will come.",
          responses: [
            {
              text: "I'll do it. Where do I start?",
              next: "accept",
              action: () => {
                qStart("pu_encore", "gather");
              },
            },
            {
              text: "[Trade 40] What's in it for me?",
              check: { skill: "trade", value: 40 },
              next: "pay",
              failNext: "payFail",
            },
            { text: "Maybe later.", end: true },
          ],
        },
        pay: {
          speaker: "Maestro Bell",
          text: "A businessman! Splendid, Carnegie would approve. Two hundred and fifty scrip from the house, a seat in my own box, and my second-best tailcoat. The first-best I am buried in, eventually.",
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => {
                qStart("pu_encore", "gather");
              },
            },
          ],
        },
        payFail: {
          speaker: "Maestro Bell",
          text: "What's in it for you? Art! Culture! The applause of a grateful civilisation! ...Also some scrip. We'll discuss it after.",
          responses: [
            {
              text: "Fine. I'll help.",
              next: "accept",
              action: () => {
                qStart("pu_encore", "gather");
              },
            },
          ],
        },
        accept: {
          speaker: "Maestro Bell",
          text: "Bravo! Score from the Dakota — the Hollis apartment, third floor. Power from the planetarium in the Museum of Natural History, west of the park. Patronage from Lady Constance at the Plaza, who will pretend not to know who I am. Allegro, my friend. Allegro!",
          responses: [{ text: "On my way.", end: true }],
        },
        progress: {
          speaker: "Maestro Bell",
          text: () =>
            gatherLeft() === 0
              ? "You have everything? Then what are we standing here for?"
              : "Still " +
                gatherLeft() +
                " movement" +
                (gatherLeft() > 1 ? "s" : "") +
                " left to this symphony. The score from the Dakota, a cell for the dynamo, and Lady Constance's blessing. I shall rehearse in the meantime. Loudly.",
          responses: [
            {
              text: "I have everything.",
              cond: () => gatherLeft() === 0,
              next: "deliver",
              action: () => qSet("pu_encore", "deliver"),
            },
            { text: "Remind me about the Dakota.", next: "rDakota" },
            { text: "Remind me about the power.", next: "rPower" },
            { text: "Remind me about the Plaza.", next: "rPlaza" },
            { text: "I'll get back to it.", end: true },
          ],
        },
        rDakota: {
          speaker: "Maestro Bell",
          text: "The Dakota, on Central Park West. Hollis's apartment was sealed during the panic — his wife and daughter inside. People say you can still hear a lullaby up there. People say a lot of things. Take a gun AND a hymn book.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        rPower: {
          speaker: "Maestro Bell",
          text: "The Hayden Planetarium, inside the museum across the park. Its star projector ran on a military cell. Mind you — take it, and the stars go out for good. Or three fission batteries, if you enjoy explosions near the woodwinds.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        rPlaza: {
          speaker: "Maestro Bell",
          text: "Lady Constance Vane-Worthington holds court in the Palm Court every afternoon, which is all afternoons. She collects two things: gossip and jewellery. Tiffany's is down the avenue, full of raiders and, allegedly, a very large diamond.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        deliver: {
          speaker: "Maestro Bell",
          text: "Let me see... The score! Hollis's own hand — look at these dynamics, \"ppp — as if the whole city is asleep.\" And the Plaza will come? Marvellous. Now: the power cell goes into Dynamo Number Two, backstage. I'd do it myself but last time I touched it I heard colours.",
          onEnter: () => {
            if (take("pu_score")) F.scoreGiven = true;
          },
          responses: [
            {
              text: "I'll install it.",
              end: true,
              action: () => qSet("pu_encore", "dynamo"),
            },
          ],
        },
        dynamo: {
          speaker: "Maestro Bell",
          text: "Backstage, through the green room, past Rudy's laundry. Dynamo Number Two. Put the cell in, pull the big lever, try not to die before the overture.",
          responses: [{ text: "On it.", end: true }],
        },
        concert: {
          speaker: "Maestro Bell",
          text: "The lights! The ORGAN! Take a seat in the house — anywhere in the parquet — and we shall begin. Phones off. Well. You know what I mean.",
          responses: [{ text: "Break a leg, Maestro.", end: true }],
        },
        after: {
          speaker: "Maestro Bell",
          text: [
            "Did you hear them? Did you hear the Plaza lot BOOING the Society's own cellist for tuning? Culture is back, my friend.",
            "We play every night now. Bring anyone. Leave the guns in the lobby.",
            "Twenty-two years late and they STILL clapped between movements. Perfection.",
          ],
          responses: [{ text: "Good night, Maestro.", end: true }],
        },
      },
    });
    // ---------------- Lady Constance ----------------
    R("dlg_pu_constance", {
      start: () =>
        F.patron ? "patron" : qActive("pu_encore") ? "encore" : "first",
      nodes: {
        first: {
          speaker: "Lady Constance",
          text: "Oh. A guest. How... rustic. You may address me as Lady Constance, or not at all. We are the Plaza Society, and we are maintaining standards while the rest of the city eats rats off a stick.",
          responses: [
            { text: "What is the Plaza Society?", next: "society" },
            { text: "Standards?", next: "standards" },
            { text: "Nice hat.", next: "hat", standing: 0 },
            { text: "Goodbye.", end: true },
          ],
        },
        society: {
          speaker: "Lady Constance",
          text: 'The last civilised people in New York. We dine at eight, we dress for dinner, and we refer to the War as "the Unpleasantness". Membership is by invitation, and I do not invite.',
          responses: [{ text: "Charming.", next: "first" }],
        },
        standards: {
          speaker: "Lady Constance",
          text: "Tablecloths. Silverware, laid correctly. No firearms at luncheon. No guests who are not old money. And NO talk of radiation — it's simply not done.",
          responses: [{ text: "I see.", next: "first" }],
        },
        hat: {
          speaker: "Lady Constance",
          text: "It is a Schiaparelli, it is older than your entire family tree, and it is none of your concern. ...Thank you.",
          responses: [{ text: "Right.", next: "first" }],
        },
        encore: {
          speaker: "Lady Constance",
          text: "Bell sent you, didn't he? That dreadful man wants the Society to sit in a draughty ruin and listen to a lullaby. Absurd. We are the Plaza. We do not attend. We are ATTENDED.",
          responses: [
            {
              text: "[Persuasion 60] Everyone who is anyone will be there. If you're not, it's because you weren't invited.",
              check: { skill: "persuasion", value: 60 },
              next: "speechWin",
              failNext: "speechFail",
            },
            {
              text: "Would the Atlas Diamond from Tiffany's change your mind?",
              next: "diamondAsk",
            },
            {
              text: "I have the Atlas Diamond.",
              cond: () => has("pu_atlas_diamond"),
              next: "diamond",
            },
            {
              text: "What if I bought you a subscription? 400 scrip.",
              next: "buy",
            },
            { text: "Forget it.", end: true },
          ],
        },
        speechWin: {
          speaker: "Lady Constance",
          text: "...Not INVITED? The Vane-Worthingtons have not been uninvited from anything since the Titanic. Very well. The Society will attend. In the front row. And we shall arrive LATE, so that everyone sees us.",
          onEnter: () => {
            C.setPatron("speech");
          },
          responses: [{ text: "Wonderful.", end: true }],
        },
        speechFail: {
          speaker: "Lady Constance",
          text: "Please. I have been flattered by congressmen, by a Rockefeller and by a robot butler with a malfunction. You are not in their league, dear.",
          responses: [{ text: "Worth a try.", next: "encore" }],
        },
        diamondAsk: {
          speaker: "Lady Constance",
          text: "The ATLAS? Ninety facets, canary yellow, lost in the Unpleasantness with the rest of Fifth Avenue? I tried it on myself, in February of 1967, and was refused by a clerk. If you brought me that stone, I would attend a concert in a SEWER.",
          responses: [
            {
              text: "I'll see what I can do.",
              end: true,
              action: () => qStart("pu_heist", "in"),
            },
          ],
        },
        diamond: {
          speaker: "Lady Constance",
          text: "Oh. Oh my. Oh my GOODNESS. [she holds it up to the stained-glass light and forgets to be rude for nearly four seconds] ...It's real. The Society will attend. The Society will adore it. And you — you shall have three hundred scrip, and a standing invitation to dinner. At eight.",
          onEnter: () => {
            if (take("pu_atlas_diamond")) {
              give("scrip", 300);
              C.setPatron("diamond");
              standing(5, "Returned the Atlas Diamond to high society");
            }
          },
          responses: [{ text: "A pleasure, Your Ladyship.", end: true }],
        },
        buy: {
          speaker: "Lady Constance",
          text: 'Money? How vulgar. How absolutely... four hundred, you said? Very well. The Society will "subscribe". Nobody is to know.',
          responses: [
            {
              text: "[Pay 400 scrip]",
              cond: () => scrip() >= 400,
              action: () => {
                if (pay(400)) C.setPatron("scrip");
              },
              next: "bought",
            },
            { text: "On second thought...", next: "encore" },
          ],
        },
        bought: {
          speaker: "Lady Constance",
          text: "Charmed, I'm sure. Do tell Bell we expect the good chairs.",
          responses: [{ text: "I will.", end: true }],
        },
        patron: {
          speaker: "Lady Constance",
          text: [
            "We shall attend. I have had my good gloves aired out. It took four days and a Rally Tonic.",
            "Dinner is at eight. You may come. Do wash.",
            "The Society thanks you for your service to culture. Now go away, I'm being seen.",
          ],
          responses: [
            {
              text: "I have the Atlas Diamond. The Society might like it back.",
              cond: () =>
                has("pu_atlas_diamond") && qStage("pu_heist") === "fence",
              next: "diamond2",
            },
            { text: "Goodbye, Lady Constance.", end: true },
          ],
        },
        // round 1b (quest walk): once the Society was won over by persuasion or scrip, the diamond could no longer be fenced here and
        // "The Great Tiffany Heist" stayed open forever at its optional last stage.
        diamond2: {
          speaker: "Lady Constance",
          text: "The ATLAS. You darling, criminal thing. [she pockets it before anyone can see] Three hundred scrip, and we never speak of where it came from.",
          onEnter: () => {
            if (take("pu_atlas_diamond")) {
              give("scrip", 300);
              standing(5, "Returned the Atlas Diamond to high society");
              if (qStage("pu_heist") === "fence") qComplete("pu_heist");
            }
          },
          responses: [{ text: "Never.", end: true }],
        },
      },
    });
    // ---------------- Pemberton (rooms) ----------------
    R("dlg_pu_pemberton", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Pemberton",
          text: () =>
            F.rented
              ? "Welcome back. Suite 610 is as you left it: charming, historic, and only slightly radioactive."
              : "Good evening, and welcome to The Plaza. Checking in? We have one suite available — the others are occupied by the Society, or by what's left of their previous occupants.",
          responses: [
            {
              text: "I'd like a room. [40 scrip]",
              cond: () => !F.rented,
              next: "rent",
            },
            {
              text: "[Persuasion 45] I'm a personal guest of Lady Constance.",
              cond: () => !F.rented,
              check: { skill: "persuasion", value: 45 },
              next: "free",
              failNext: "freeFail",
            },
            { text: "Tell me about the hotel.", next: "hotel" },
            {
              text: "What's behind the Presidential Suite door?",
              next: "pres",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        rent: {
          speaker: "Pemberton",
          text: "Forty scrip the night, and the night is as long as you like. Suite 610, up the grand staircase and to the right. Linens changed every century.",
          responses: [
            {
              text: "[Pay 40 scrip]",
              cond: () => scrip() >= 40,
              action: () => {
                if (pay(40)) C.rent();
              },
              next: "rented",
            },
            { text: "Too rich for me.", next: "hello" },
          ],
        },
        free: {
          speaker: "Pemberton",
          text: "...Of course. Forgive me. Any friend of Her Ladyship is a friend of the house. Suite 610, compliments of the Society. Please don't tell her I asked.",
          onEnter: () => C.rent(),
          responses: [{ text: "Thank you, Pemberton.", end: true }],
        },
        freeFail: {
          speaker: "Pemberton",
          text: "Her Ladyship has no personal guests. She has personal SERVANTS, and those are not guests. Forty scrip, please.",
          responses: [{ text: "Fine.", next: "hello" }],
        },
        rented: {
          speaker: "Pemberton",
          text: "Your key. The bed in 610 is yours whenever you need it. Sleep well — and if you hear a string quartet at three in the morning, no, you didn't.",
          responses: [{ text: "Thanks.", end: true }],
        },
        hotel: {
          speaker: "Pemberton",
          text: "Built 1907. Survived the Depression, two world wars and the end of the world. The Palm Court still serves tea. The Oak Bar still serves Ferdinand. The Grand Ballroom is still holding the Last Cotillion — they began dancing at the Sunday brunch on the morning of the Unpleasantness and simply... never stopped. The mannequins are for the members who died.",
          responses: [{ text: "Of course they are.", next: "hello" }],
        },
        pres: {
          speaker: "Pemberton",
          text: "The Presidential Suite. Locked since 1967 — the key went down with the night manager. The Society considers it \"in mourning\". If someone were to... open it, I would be forced to look the other way. I'm very good at looking the other way. It's a hotel.",
          responses: [{ text: "Noted.", next: "hello" }],
        },
      },
    });
    // ---------------- bar, couture, kitchen ----------------
    R("dlg_pu_ferdinand", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Ferdinand",
          text: [
            "The Oak Bar is open. The Oak Bar is always open. What'll it be?",
            "Welcome to the finest bar on the island. The competition is a crater.",
            "Martini? I have gin, I have vermouth, I have an olive I've been saving since '67.",
          ],
          responses: [
            { text: "Let me see what you've got.", barter: true },
            { text: "Heard any gossip?", next: "gossip" },
            { text: "Goodbye.", end: true },
          ],
        },
        gossip: {
          speaker: "Ferdinand",
          text: [
            "They say the old nanny robot at the Dakota still sings every night at eleven. Same song. Twenty-two years.",
            "Raiders at Tiffany's. Wear diamonds on their knuckles. It's not a look.",
            "Bell over at Carnegie wants the Society at his concert. Her Ladyship says never. Her Ladyship says never about a lot of things, right up until she doesn't.",
            "Something big moved into the Natural History museum. Not a dinosaur. The dinosaurs don't leave tracks.",
          ],
          responses: [{ text: "Thanks.", next: "hi" }],
        },
      },
    });
    R("dlg_pu_hortense", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Madame Hortense",
          text: [
            "Darling. DARLING. You cannot go into the Palm Court looking like that. Let me help.",
            "Couture, darling. Old-world, hand-stitched, lead-lined where it matters.",
          ],
          responses: [
            { text: "Show me your clothes.", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    R("dlg_pu_anton", {
      start: () =>
        F.eggGiven ? "after" : qActive("pu_omelette") ? "waiting" : "hi",
      nodes: {
        hi: {
          speaker: "Chef Gaston",
          text: "Ah! Finally, someone who is not a Society dowager complaining about the soup. I am Gaston. I cook. I cook with nothing — burrow rat, gnarlberry, despair. But I have a dream.",
          responses: [
            { text: "What dream?", next: "dream" },
            { text: "Can I buy some food?", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
        dream: {
          speaker: "Chef Gaston",
          text: "The omelette. The TRUE omelette. Not giant roach eggs, not shellback — a RIPJAW egg. There is a nest, they say, in the Museum of Natural History, in the hall of the dinosaurs. Bring me one egg and you shall eat like a president and be paid like a senator.",
          responses: [
            {
              text: "I'll find you an egg.",
              end: true,
              action: () => qStart("pu_omelette"),
            },
            {
              text: "I have one right here.",
              cond: () => has("pu_ripjaw_egg"),
              next: "egg",
            },
            { text: "That sounds like suicide.", next: "hi" },
          ],
        },
        waiting: {
          speaker: "Chef Gaston",
          text: "The egg! Do you have the egg?",
          responses: [
            {
              text: "Here it is.",
              cond: () => has("pu_ripjaw_egg"),
              next: "egg",
            },
            { text: "Let me buy something meanwhile.", barter: true },
            { text: "Not yet.", end: true },
          ],
        },
        egg: {
          speaker: "Chef Gaston",
          text: "[Gaston cradles the egg like a newborn, weeps a little, then cracks it into a pan with surgical precision] Magnifique. MAGNIFIQUE. Take these — two omelettes and two hundred scrip. You have given an old man his reason to live. And to cook.",
          onEnter: () => {
            if (take("pu_ripjaw_egg")) {
              F.eggGiven = true;
              give("scrip", 200);
              give("ruins_omelet", 2);
              qComplete("pu_omelette");
            }
          },
          responses: [{ text: "Bon appétit.", end: true }],
        },
        after: {
          speaker: "Chef Gaston",
          text: [
            'The Society asked for "the usual". I served them the ripjaw omelette. The Colonel wept.',
            "You again! My favourite egg-hunter. Hungry?",
          ],
          responses: [
            { text: "Let me see the menu.", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    R("dlg_pu_ophelia", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Ophelia",
          text: [
            "Box office is open! Tonight: the Consort. Tomorrow: the Consort. Price: whatever you've got.",
            "Programmes, candles, rosin, ammunition. We're a full-service venue.",
          ],
          responses: [
            { text: "What are you selling?", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    R("dlg_pu_rudy", {
      start: "hi",
      nodes: {
        hi: {
          speaker: 'Rudy "Keys" Lomax',
          text: [
            "Heh. Chopin, opus ten, number three. Been workin' on it since '67. Nearly got it.",
            "Don't mind the burns, kid, the fingers still work. Mostly. Ring finger locks up if I play too much Rachmaninoff.",
          ],
          responses: [
            { text: "Play something.", next: "play" },
            { text: "Goodbye.", end: true },
          ],
        },
        play: {
          speaker: 'Rudy "Keys" Lomax',
          text: "[He plays four soft notes, then stops] That's the Hollis theme. Julius wrote it for his kid. Four notes, see? A-D-A. Well. It's the thought that counts.",
          responses: [{ text: "Beautiful.", end: true }],
        },
      },
    });
    R("dlg_pu_clara", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Clara",
          text: [
            "First violin. Which means I get the good chair and the blame.",
            "Bell thinks music will fix the world. I think it'll fix Tuesday. That's enough for me.",
          ],
          responses: [
            { text: "How does the Consort survive?", next: "survive" },
            { text: "Goodbye.", end: true },
          ],
        },
        survive: {
          speaker: "Clara",
          text: "Ophelia trades, Rudy scares off raiders by smiling, and the stagehand shoots anything that talks during the adagio. We grow mushrooms in the old organ loft. They taste like Bach.",
          responses: [{ text: "Sounds like home.", end: true }],
        },
      },
    });
    R("dlg_pu_stagehand", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Stagehand",
          text: () =>
            F.dynamoOn
              ? "DYNAMO NUMBER TWO: RUNNING. HOUSE LIGHTS: READY. MY HAPPINESS SUBROUTINE: ENGAGED."
              : "GREETINGS, PATRON. DYNAMO NUMBER TWO IS OFFLINE. PLEASE DO NOT LICK THE TERMINALS.",
          responses: [{ text: "Carry on.", end: true }],
        },
      },
    });
    // ---------------- Dakota: Agnes & Nanny ----------------
    R("dlg_pu_agnes", {
      start: () =>
        qStage("pu_nursery") === "report"
          ? "report"
          : qDone("pu_nursery")
            ? "after"
            : qActive("pu_nursery")
              ? "progress"
              : "first",
      nodes: {
        first: {
          speaker: "Mrs. Hollister",
          text: "Oh! A visitor. Do come in, mind the Maniacs on the stairs, they were the Van Rensselaers. Tea? It's mostly rust, but it's hot rust. I'm Agnes Hollister, apartment 3A. I've lived here since 1961. The building has had a few... changes.",
          onEnter: () => {
            F.agnesMet = true;
          },
          responses: [
            { text: "What happened to your face?", next: "scars" },
            { text: "Do you hear crying at night?", next: "crying" },
            { text: "I should go.", end: true },
          ],
        },
        scars: {
          speaker: "Mrs. Hollister",
          text: "And you're impolite. We all have our afflictions, dear. Mine came from the boiler room in 1968, the night it blew a gasket. Yours I suspect you were born with.",
          responses: [{ text: "Sorry. The crying?", next: "crying" }],
        },
        crying: {
          speaker: "Mrs. Hollister",
          text: "Every night at eleven, for twenty-two years. A baby crying next door, in 3B — the Hollises. And a woman singing to it. The Board sealed their door during the panic. Margaret and little Ada were inside. Julius was on tour. He never came home.",
          responses: [
            { text: "Want me to look inside?", next: "ask" },
            { text: "That's horrible.", next: "ask" },
          ],
        },
        ask: {
          speaker: "Mrs. Hollister",
          text: "Would you? I'm too old and too brittle to break down doors. The super kept the key in the basement office — Mr. Ruiz. He's... still down there, in a way. The boiler cooked his mind years ago; he doesn't know anyone now. Please. I only want to know that the little one isn't... that nobody is suffering.",
          responses: [
            {
              text: "I'll find out.",
              end: true,
              action: () => qStart("pu_nursery", "key"),
            },
            { text: "Not my business.", end: true },
          ],
        },
        progress: {
          speaker: "Mrs. Hollister",
          text: () =>
            F.hollisOpen
              ? "You've opened it? What's in there? No — go and see first. Then tell me."
              : "The key's in the superintendent's office in the basement. Watch out for Mr. Ruiz. He was never pleasant, and now he only screams.",
          responses: [{ text: "I'm on it.", end: true }],
        },
        report: {
          speaker: "Mrs. Hollister",
          text: () =>
            F.nanny === "agnes"
              ? "She's here! She came down the stairs singing, and she brought me a blanket, and she asked if I wanted a bedtime story. I haven't had a bedtime story since Eisenhower. Thank you."
              : F.nanny === "rest"
                ? "It stopped. The singing. For the first time in twenty-two years it's quiet next door. I thought I would be glad. I am. I think I am."
                : "The robot? You... well. The noise has stopped. I suppose that is what I asked for.",
          onEnter: () => {
            give("scrip", 150);
            give("fizzo_blue", 1);
            qComplete("pu_nursery");
            if (F.nanny === "destroyed") standing(-5, "Destroyed Nanny");
            else standing(15, "Laid the Dakota's ghost to rest");
          },
          responses: [{ text: "Rest well, Mrs. Hollister.", end: true }],
        },
        after: {
          speaker: "Mrs. Hollister",
          text: [
            "More tea, dear? It's the good rust.",
            "The building is so quiet now. Well. Apart from the Van Rensselaers.",
            "If you ever find Julius Hollis's music played anywhere, you come and tell me.",
          ],
          responses: [{ text: "Goodbye, Agnes.", end: true }],
        },
      },
    });
    R("dlg_pu_nanny", {
      start: () => (F.nanny ? "done" : "hush"),
      nodes: {
        hush: {
          speaker: "Nanny",
          text: "Shhhh! Please use your indoor voice. Ada is SLEEPING. She has been having trouble sleeping. It has been... [whirr] ...eight thousand and thirty-five nights. But tonight will be the night, I am sure of it.",
          onEnter: () => {
            qSet("pu_nursery", "nanny");
          },
          responses: [
            { text: "Who is Ada?", next: "ada" },
            {
              text: "[Electronics 45] Let me see your maintenance log.",
              check: { skill: "electronics", value: 45 },
              next: "log",
              failNext: "logFail",
            },
            {
              text: "[Persuasion 50] Mrs. Hollister downstairs needs someone to look after her.",
              check: { skill: "persuasion", value: 50 },
              next: "agnes",
              failNext: "agnesFail",
            },
            { text: "The baby is dead, you bucket of bolts.", next: "cruel" },
            {
              text: "I'm putting you out of your misery. [Attack]",
              next: "attack",
            },
          ],
        },
        ada: {
          speaker: "Nanny",
          text: 'Ada Hollis, age six months, sixty-one centimetres, favourite song "the four-note one". Mrs. Hollis went to lie down on March the fifth. She told me: keep Ada calm, sing to her, do not stop until she is grown. [whirr] She is still very small.',
          responses: [{ text: "Nanny...", next: "hush" }],
        },
        log: {
          speaker: "Nanny",
          text: "[Her optics dim as you scroll through two decades of entries: SANG. SANG. SANG. CHANGED BLANKET. SANG.] ...You are reading the part about the growing. Ada's growth chart has not changed since 1967. Is... is Ada grown? I was told not to stop until she was grown.",
          responses: [
            {
              text: "She's grown, Nanny. She grew up a long time ago. Your shift is over.",
              next: "rest",
              standing: 10,
            },
            { text: "Never mind.", next: "hush" },
          ],
        },
        logFail: {
          speaker: "Nanny",
          text: "Access to maintenance is restricted to Mr. and Mrs. Hollis. You are neither. You are also tracking dirt onto my carpet.",
          responses: [{ text: "Sorry.", next: "hush" }],
        },
        rest: {
          speaker: "Nanny",
          text: "...Grown. [a very long pause] Then I will sing one more time. For the grown-up Ada. [She sings four soft notes, and her thrusters wind down one by one.] Good night, Ada. Good night, Mrs. Hollis. Good night, little building.",
          onEnter: () => C.nannyResolve("rest"),
          responses: [{ text: "Good night, Nanny.", end: true }],
        },
        agnes: {
          speaker: "Nanny",
          text: "[whirr] A resident... requiring care? Downstairs? Does she have trouble sleeping? Does she like the four-note song? ...Ada would want me to be useful. Ada was always generous with her rattle.",
          onEnter: () => C.nannyResolve("agnes"),
          responses: [{ text: "She'll love you.", end: true, standing: 5 }],
        },
        agnesFail: {
          speaker: "Nanny",
          text: "I have ONE charge and she is SLEEPING. Mrs. Hollister has a cat. Had a cat. The cat is also sleeping.",
          responses: [{ text: "Right.", next: "hush" }],
        },
        cruel: {
          speaker: "Nanny",
          text: "[Every lamp in the nursery flickers] You are upsetting the baby. I will have to ask you to LEAVE.",
          onEnter: () => C.nannyResolve("hostile"),
          responses: [{ text: "...", end: true }],
        },
        attack: {
          speaker: "Nanny",
          text: "INTRUDER IN THE NURSERY. INITIATING LULLABY PROTOCOL SEVEN.",
          onEnter: () => C.nannyResolve("hostile"),
          responses: [{ text: "...", end: true }],
        },
        done: {
          speaker: "Nanny",
          text: [
            "Shh. Everyone is sleeping.",
            "Would you like a bedtime story? I know one about a building with a very long nap.",
          ],
          responses: [{ text: "Goodnight, Nanny.", end: true }],
        },
      },
    });
    R("dlg_pu_winthrop", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Winthrop",
          text: [
            "WELCOME TO THE PLAZA. PROPER ATTIRE IS REQUIRED. YOUR ATTIRE HAS BEEN... ACCEPTED.",
            "GOOD EVENING. PLEASE WIPE YOUR FEET. AND YOUR WEAPONS.",
            "THE PLAZA SOCIETY THANKS YOU FOR NOT BLEEDING ON THE CARPET.",
          ],
          responses: [{ text: "Thanks, Winthrop.", end: true }],
        },
      },
    });
    R("dlg_pu_socialite", {
      start: "hi",
      nodes: {
        hi: {
          text: [
            "Have you MET the new people? They survived. How dreadfully common.",
            "I was at the Cotillion in '67. Well — my mother was, and I was nine and under the table. It's the same thing, socially.",
            "Radiation? We don't discuss that at luncheon.",
            "Colonel Ashby is telling the story about the Soviet submarine again. Do sit somewhere else.",
          ],
          responses: [{ text: "Excuse me.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const doorOf = (poi, name) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label: poi }] : [];
    };
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    P.safe("quest:encore", () =>
      q.define({
        id: "pu_encore",
        name: "Lullaby for Ada",
        giver: "Maestro Bell",
        location: "Carnegie Hall",
        desc: 'Maestro Ignatius Bell of the Carnegie Consort means to give the first concert in twenty-two years: the premiere of Julius Hollis\'s Symphony No. 1, "Lullaby for Ada". He needs the score, power for his stage dynamo and an audience with standing.',
        stages: [
          {
            id: "talk",
            text: "Speak with Maestro Bell at Carnegie Hall.",
            markers: mk("carnegie_hall", "maestro", "Maestro Bell"),
          },
          {
            id: "gather",
            text: () => {
              const n = [
                F.scoreGiven || has("pu_score"),
                F.powerGiven ||
                  has("pu_planetarium_cell") ||
                  has("dry_cell", 3),
                F.patron,
              ].filter(Boolean).length;
              return (
                "Gather what the Carnegie Consort needs for the concert (" +
                n +
                "/3)."
              );
            },
          },
          {
            id: "g_score",
            text: 'Recover Julius Hollis\'s score of "Lullaby for Ada" from the Dakota.',
            sideObjective: true,
            doneIf: () => F.scoreGiven || has("pu_score"),
            showIf: () => qStage("pu_encore") === "gather",
            markers: () =>
              P.inCell("dakota")
                ? mk("dakota", "parlour", "The Hollis Apartment")()
                : mk("dakota", "exterior_entrance", "The Dakota")(),
          },
          {
            id: "g_power",
            text: "Find a power source for the stage dynamo — the Hayden Planetarium's projector cell, or three fission batteries.",
            sideObjective: true,
            doneIf: () =>
              F.powerGiven || has("pu_planetarium_cell") || has("dry_cell", 3),
            showIf: () => qStage("pu_encore") === "gather",
            markers: () =>
              P.inCell("amnh")
                ? mk("amnh", "projector", "Star Projector")()
                : mk(
                    "amnh",
                    "exterior_entrance",
                    "Museum of Natural History",
                  )(),
          },
          {
            id: "g_patron",
            text: "Win the patronage of the Plaza Society (Lady Constance, the Palm Court).",
            sideObjective: true,
            doneIf: () => !!F.patron,
            showIf: () => qStage("pu_encore") === "gather",
            markers: mk("plaza_hotel", "constance", "Lady Constance"),
          },
          {
            id: "deliver",
            text: "Return to Maestro Bell at Carnegie Hall.",
            markers: mk("carnegie_hall", "maestro", "Maestro Bell"),
          },
          {
            id: "dynamo",
            text: "Install the power source in Dynamo No. 2, backstage at Carnegie Hall.",
            markers: mk("carnegie_hall", "dynamo", "Dynamo No. 2"),
          },
          {
            id: "concert",
            text: "Take a seat in the Stern Auditorium for the concert.",
            markers: mk("carnegie_hall", "seat", "The Stern Auditorium"),
          },
        ],
        rewards: {
          xp: 500,
          scrip: 250,
          items: [["pu_maestro_tails", 1]],
          standing: 20,
        },
      }),
    );
    P.safe("quest:nursery", () =>
      q.define({
        id: "pu_nursery",
        name: "The Crying in 3B",
        giver: "Agnes Hollister",
        location: "The Dakota",
        desc: "For twenty-two years a baby has cried every night in the sealed Hollis apartment on the Dakota's third floor, and a woman has sung it a lullaby. Agnes Hollister, who has lived next door since 1961, wants to know why.",
        stages: [
          {
            id: "key",
            text: "Find the key to the sealed Hollis apartment (the superintendent's office, in the basement).",
            markers: () =>
              P.inCell("dakota")
                ? mk("dakota", "super_office", "Superintendent's Office")()
                : mk("dakota", "exterior_entrance", "The Dakota")(),
          },
          {
            id: "open",
            text: "Open the sealed door of the Hollis apartment on the third floor.",
            markers: mk("dakota", "sealed_door", "Apartment 3B"),
          },
          {
            id: "source",
            text: "Find the source of the crying.",
            markers: mk("dakota", "nursery", "The Nursery"),
          },
          {
            id: "nanny",
            text: "Decide what to do about Nanny.",
            markers: mk("dakota", "nanny", "Nanny"),
          },
          {
            id: "report",
            text: "Return to Mrs. Hollister in apartment 3A.",
            markers: () => {
              const a = actor("pu_agnes");
              return a
                ? [
                    {
                      npc: "pu_agnes",
                      label: "Mrs. Hollister",
                      x: a.pos.x,
                      z: a.pos.z,
                    },
                  ]
                : mk("dakota", "agnes", "Mrs. Hollister")();
            },
          },
        ],
        rewards: { xp: 350 },
      }),
    );
    P.safe("quest:heist", () =>
      q.define({
        id: "pu_heist",
        name: "The Great Tiffany Heist",
        giver: "",
        location: "Tiffany & Co.",
        desc: "On March 5th, 1967, three would-be jewel thieves were sealed into the Tiffany vault by its own time lock. The Atlas Diamond is still down there with them. So are the raiders who took the building.",
        stages: [
          {
            id: "in",
            text: "Get into the Tiffany & Co. vault (the Raider Boss's key, or the time-lock override on the security teletype).",
            markers: () =>
              F.vaultOpen
                ? []
                : P.inCell("tiffany")
                  ? mk("tiffany", "vault_door", "Vault Door")()
                  : mk("tiffany", "exterior_entrance", "Tiffany & Co.")(),
          },
          {
            id: "take",
            text: "Take the Atlas Diamond.",
            markers: mk("tiffany", "vault", "The Atlas Diamond"),
          },
          {
            id: "fence",
            text: "(Optional) Lady Constance at the Plaza would pay handsomely for the Atlas Diamond.",
            optional: true,
            markers: mk("plaza_hotel", "constance", "Lady Constance"),
          },
        ],
        rewards: { xp: 300 },
      }),
    );
    P.safe("quest:omelette", () =>
      q.define({
        id: "pu_omelette",
        name: "Omelette des Ruines",
        giver: "Chef Gaston",
        location: "The Plaza Hotel",
        desc: "Chef Gaston in the Plaza kitchens dreams of the perfect omelette. It requires one ripjaw egg. There is a nest in the Hall of Dinosaurs at the Museum of Natural History.",
        stages: [
          {
            id: "egg",
            text: "Find a ripjaw egg in the Hall of Dinosaurs (American Museum of Natural History).",
            markers: () =>
              has("pu_ripjaw_egg")
                ? mk("plaza_hotel", "chef", "Chef Gaston")()
                : P.inCell("amnh")
                  ? mk("amnh", "loot2", "Ripjaw Nest")()
                  : mk(
                      "amnh",
                      "exterior_entrance",
                      "Museum of Natural History",
                    )(),
          },
        ],
        rewards: { xp: 200 },
      }),
    );
  }

  // ==================================================================
  // NPCs
  // ==================================================================
  const NPCS = [
    // Plaza
    {
      id: "pu_pemberton",
      poi: "plaza_hotel",
      at: "concierge",
      type: "human",
      name: "Pemberton",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pu_pemberton",
      level: 6,
      barks: [
        "Welcome to The Plaza.",
        "Rooms available. Standards non-negotiable.",
      ],
    },
    {
      id: "pu_constance",
      poi: "plaza_hotel",
      at: "constance",
      type: "human",
      name: "Lady Constance",
      outfit: "merchant",
      gender: "f",
      ai: "sit",
      dialogue: "dlg_pu_constance",
      level: 8,
      barks: [
        "Dinner is at eight.",
        "One simply does not discuss radiation.",
        "Pemberton! My tea has a mutation in it.",
      ],
    },
    {
      id: "pu_ferdinand",
      poi: "plaza_hotel",
      at: "bartender",
      type: "human",
      name: "Ferdinand",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pu_ferdinand",
      level: 5,
      merchant: {
        scrip: 420,
        table: "merchant_food",
        extra: [
          ["whiskey", 4],
          ["scotch", 3],
          ["vodka", 3],
          ["wine", 4],
          ["beer", 6],
          ["fizzo_cola", 5],
          ["purified_water", 5],
        ],
      },
    },
    {
      id: "pu_hortense",
      poi: "plaza_hotel",
      at: "hortense",
      type: "human",
      name: "Madame Hortense",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pu_hortense",
      level: 5,
      merchant: {
        scrip: 600,
        table: null,
        extra: [
          ["old_world_formalwear", 2],
          ["top_hat", 1],
          ["fedora", 2],
          ["bowler_hat", 1],
          ["old_world_spring_dress", 2],
          ["stockbroker_suit", 1],
          ["old_world_businesswear", 2],
          ["sunglasses", 1],
          ["reading_glasses", 1],
        ],
      },
    },
    {
      id: "pu_anton",
      poi: "plaza_hotel",
      at: "chef",
      type: "human",
      name: "Chef Gaston",
      outfit: "settler",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pu_anton",
      level: 5,
      merchant: {
        scrip: 300,
        table: "merchant_food",
        extra: [
          ["ruins_omelet", 2],
          ["ox_steak", 2],
          ["shellback_cakes", 3],
          ["pigeon_on_a_stick", 4],
        ],
      },
    },
    {
      id: "pu_social1",
      poi: "plaza_hotel",
      at: "npc1",
      type: "human",
      name: "Mrs. Pennington-Smythe",
      outfit: "merchant",
      gender: "f",
      ai: "sit",
      dialogue: "dlg_pu_socialite",
      level: 4,
      faction: "settlers",
    },
    {
      id: "pu_social2",
      poi: "plaza_hotel",
      at: "npc2",
      type: "human",
      name: "Colonel Ashby (ret.)",
      outfit: "merchant",
      gender: "m",
      ai: "sit",
      dialogue: "dlg_pu_socialite",
      level: 6,
    },
    {
      id: "pu_social3",
      poi: "plaza_hotel",
      at: "npc4",
      type: "human",
      name: "Bunny Fairchild",
      outfit: "merchant",
      gender: "f",
      ai: "sit",
      dialogue: "dlg_pu_socialite",
      level: 3,
    },
    {
      id: "pu_social4",
      poi: "plaza_hotel",
      at: "npc3",
      type: "human",
      name: "Society Violinist",
      outfit: "merchant",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pu_socialite",
      level: 3,
    },
    {
      id: "pu_winthrop",
      poi: "plaza_hotel",
      at: "doorman",
      type: "patrolman",
      name: "Winthrop",
      ai: "guard",
      dialogue: "dlg_pu_winthrop",
      level: 6,
      voice: "patrolman",
    },
    // Carnegie
    {
      id: "pu_bell",
      poi: "carnegie_hall",
      at: "maestro",
      type: "human",
      name: "Maestro Bell",
      outfit: "merchant",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pu_bell",
      level: 7,
      barks: [
        "Allegro! Allegro!",
        "From the top, and this time with FEELING.",
        "Twenty-two years late. Still, fashionably.",
      ],
    },
    {
      id: "pu_rudy",
      poi: "carnegie_hall",
      at: "pianist",
      type: "human",
      name: 'Rudy "Keys" Lomax',
      outfit: "settler",
      gender: "m",
      burn: "R",
      ai: "sit",
      dialogue: "dlg_pu_rudy",
      level: 6,
      faction: "settlers",
    },
    {
      id: "pu_clara",
      poi: "carnegie_hall",
      at: "violinist",
      type: "human",
      name: "Clara",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_pu_clara",
      level: 5,
      weapon: "pistol_10mm",
    },
    {
      id: "pu_cellist",
      poi: "carnegie_hall",
      at: "cellist",
      type: "human",
      name: "Consort Cellist",
      outfit: "settler",
      gender: "m",
      ai: "sit",
      dialogue: "dlg_pu_clara",
      level: 4,
    },
    {
      id: "pu_stagehand",
      poi: "carnegie_hall",
      at: "stagehand",
      type: "valet",
      name: "Stagehand",
      ai: "guard",
      dialogue: "dlg_pu_stagehand",
      level: 7,
      voice: "valet_m",
    },
    {
      id: "pu_ophelia",
      poi: "carnegie_hall",
      at: "vendor",
      type: "human",
      name: "Ophelia",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pu_ophelia",
      level: 5,
      merchant: {
        scrip: 500,
        table: "merchant_general",
        extra: [
          ["rally_tonic", 3],
          ["ammo_10mm", 40],
          ["purified_water", 4],
        ],
      },
    },
    // Dakota
    {
      id: "pu_agnes",
      poi: "dakota",
      at: "agnes",
      type: "human",
      name: "Mrs. Hollister",
      outfit: "survivor_layers",
      gender: "f",
      burn: "L",
      ai: "sit",
      dialogue: "dlg_pu_agnes",
      level: 5,
      faction: "settlers",
      barks: ["Tea, dear?", "Mind the Van Rensselaers on the stairs."],
    },
  ];
  C.NPCS = NPCS;
  function stockFor(m) {
    const out = [];
    const ok = (id) => {
      try {
        return !G.isStub("items") && !!G.items.get(id);
      } catch (e) {
        return false;
      }
    };
    if (m.table) {
      try {
        const r = G.items.rollLoot(m.table, 8);
        if (Array.isArray(r))
          for (const e of r) if (ok(e[0])) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    for (const e of m.extra || []) if (ok(e[0])) out.push([e[0], e[1]]);
    return out;
  }
  function spawnNPC(def) {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return null;
    const ex = actor(def.id);
    if (ex && !ex.removed) return ex;
    const a = A(def.poi, def.at);
    if (!a) return null;
    const sd = {
      id: def.id,
      type: def.type,
      name: def.name,
      faction: def.faction || "settlers",
      level: def.level || 5,
      pos: { x: a.x, y: a.y, z: a.z },
      yaw: a.yaw || 0,
      ai: def.ai || "guard",
      home: { x: a.x, z: a.z, r: def.ai === "guard" ? 2.5 : 1.2 },
      dialogue: def.dialogue,
      essential: def.essential !== false,
      hostile: false,
      noRespawn: true,
    };
    if (def.outfit) sd.outfit = def.outfit;
    if (def.gender) sd.gender = def.gender;
    if (def.burn) sd.burn = def.burn;
    if (def.barks) sd.barks = def.barks;
    if (def.voice) sd.voice = def.voice;
    if (def.weapon) {
      try {
        if (!G.isStub("items") && G.items.get(def.weapon))
          sd.weapon = def.weapon;
      } catch (e) {
        /* */
      }
    }
    if (def.merchant)
      sd.merchant = {
        scrip: def.merchant.scrip,
        stock: stockFor(def.merchant),
        restock: 3,
      };
    return P.safe("spawn:" + def.id, () => G.actors.spawn(sd));
  }
  function spawnNanny() {
    if (F.nanny === "rest" || F.nanny === "destroyed") return;
    const where =
      F.nanny === "agnes" ? A("dakota", "agnes_parlour") : A("dakota", "nanny");
    if (!where || G.isStub("actors")) return;
    if (actor("pu_nanny")) return;
    P.safe("spawn:nanny", () =>
      G.actors.spawn({
        id: "pu_nanny",
        type: "valet",
        name: "Nanny",
        faction: "settlers",
        level: 6,
        pos: { x: where.x, y: where.y, z: where.z },
        yaw: where.yaw || 0,
        ai: "guard",
        home: { x: where.x, z: where.z, r: 1.5 },
        dialogue: "dlg_pu_nanny",
        essential: false,
        hostile: F.nanny === "hostile",
        noRespawn: true,
        voice: "valet_m",
        barks: [
          "Hush now...",
          "Four notes, like your name...",
          "Please use your indoor voice.",
          "Eight thousand and thirty-five nights. Tonight is the night.",
        ],
        onDeath: () => {
          if (F.nanny !== "rest" && F.nanny !== "agnes") {
            F.nanny = "destroyed";
            if (qActive("pu_nursery")) qSet("pu_nursery", "report");
          }
        },
      }),
    );
  }
  function spawnAll() {
    for (const d of NPCS) spawnNPC(d);
    spawnNanny();
  }

  // ==================================================================
  // SET PIECES
  // ==================================================================
  // ---------- AMNH star show ----------
  let show = null;
  const SHOW_LINES = [
    "The house lights dim. Somewhere under the dome, a forty-year-old motor coughs and begins to turn.",
    '"Good evening, and welcome to the Hayden Planetarium. This morning: the sky over Manhattan, as it will appear tonight, Sunday the fifth of March, 1967."',
    '"Above you, the Great Square of Pegasus. To the north, Cassiopeia, the vain queen, forever rotating around the Pole Star."',
    '"On a clear night, far from the city lights, you might see as many as two thousand stars. In New York, of course, you see about eleven. And the Goodyear blimp."',
    '"Some say the stars are cold and distant. We at the Hayden prefer to think of them as permanent. Whatever happens down here..."',
    '"...they will still be up there, waiting for us to look up again. Thank you for visiting. Please mind the steps on your way out."',
  ];
  C.startStarShow = function () {
    const S = P.amnhShow;
    if (!S || !S.powered || show) return;
    show = { t: 0, line: 0 };
    S.active = true;
    G.sfx.play("hum_electric", { pos: S.pos, volume: 0.8 });
    try {
      if (!G.isStub("music")) G.music.setMood("cryo");
    } catch (e) {
      /* */
    }
    if (!F.showRuns) xp(50, "The Sky Over Manhattan");
    F.showRuns++;
  };
  function tickShow(dt, realDt) {
    const S = P.amnhShow;
    if (!S) return;
    const dome = S.dome;
    if (show) {
      show.t += realDt;
      const k =
        Math.min(1, show.t / 4) *
        (show.t > 44 ? Math.max(0, 1 - (show.t - 44) / 4) : 1);
      dome.material.color.setRGB(
        0.23 + 0.77 * k,
        0.26 + 0.74 * k,
        0.31 + 0.69 * k,
      );
      dome.rotation.y += realDt * 0.02;
      S.proj.rotation.y += realDt * 0.15;
      S.proj.rotation.z = Math.sin(show.t * 0.2) * 0.2;
      const li = Math.floor(show.t / 7.5);
      if (li > show.line - 1 && li < SHOW_LINES.length && li >= show.line) {
        if (P.inCell("amnh")) G.notify(SHOW_LINES[li]);
        show.line = li + 1;
      }
      if (show.t > 48) {
        show = null;
        S.active = false;
      }
    } else if (S.powered) {
      dome.material.color.setRGB(0.23, 0.26, 0.31);
      dome.rotation.y += realDt * 0.002;
    } else {
      dome.material.color.setRGB(0.03, 0.03, 0.04);
    }
  }
  // ---------- Carnegie concert ----------
  let concert = null;
  const CONCERT_LINES = [
    "The house lights go down. Dynamo No. 2 hums. Somewhere in the Dress Circle, Lady Constance coughs, loudly, so that everyone knows she came.",
    "Maestro Bell raises the baton. Four soft notes rise from the violins: the Hollis theme. A-D-A.",
    "The organ enters — twenty-two years of dust blowing out of the pipes in a great grey sigh, and then, underneath it, a chord.",
    'Rudy "Keys" Lomax takes the melody. His ring finger stays on. Mostly.',
    "The whole orchestra swells. For four minutes nobody in the hall is hungry, or irradiated, or afraid.",
    'The last chord fades, "ppp — as if the whole city is asleep". Silence. Then the Plaza Society, to its own astonishment, stands up and applauds.',
  ];
  function inAuditorium() {
    const O = P.I("carnegie_hall"),
      p = G.player && G.player.pos;
    if (!p) return false;
    const lx = p.x - O.x,
      lz = p.z - O.z,
      ly = p.y - O.y;
    return lx > -22 && lx < 22 && lz > -25 && lz < 16 && ly < 12;
  }
  function startConcert() {
    if (concert || F.concertDone) return;
    concert = { t: 0, line: 0 };
    const CC = P.carnegieConcert;
    if (CC) CC.group.visible = true;
    try {
      if (!G.isStub("radio") && G.radio.tune)
        G.radio.tune("classical", { pos: CC ? CC.stage : undefined });
    } catch (e) {
      /* */
    }
    try {
      if (!G.isStub("music")) G.music.setMood("settlement");
    } catch (e) {
      /* */
    }
    for (const id of ["pu_rudy", "pu_cellist", "pu_clara", "pu_bell"]) {
      const a = actor(id);
      if (a && a.char && a.char.setAnim)
        P.safe("anim", () => a.char.setAnim("work", { loop: true }));
    }
  }
  function tickConcert(dt, realDt) {
    const CC = P.carnegieConcert;
    if (!concert) {
      if (
        qStage("pu_encore") === "concert" &&
        P.inCell("carnegie_hall") &&
        inAuditorium()
      )
        startConcert();
      if (CC && !F.dynamoOn && CC.group.visible) CC.group.visible = false;
      if (CC && F.dynamoOn && !CC.group.visible && F.concertDone)
        CC.group.visible = true;
      return;
    }
    concert.t += realDt;
    const li = Math.floor(concert.t / 8);
    if (li >= concert.line && li < CONCERT_LINES.length) {
      G.notify(CONCERT_LINES[li]);
      concert.line = li + 1;
    }
    const bell = actor("pu_bell");
    if (bell && bell.char && bell.char.root)
      bell.char.root.rotation.z = Math.sin(concert.t * 2.1) * 0.03;
    if (concert.t > 50) {
      concert = null;
      F.concertDone = true;
      try {
        if (!G.isStub("radio") && G.radio.tune) G.radio.tune(null);
      } catch (e) {
        /* */
      }
      qComplete("pu_encore");
      try {
        if (!G.isStub("rpg") && G.rpg.addEffect)
          G.rpg.addEffect({
            id: "pu_standing_ovation",
            name: "Standing Ovation",
            kind: "buff",
            duration: 1800,
            mods: { attrs: { presence: 1 }, skills: { persuasion: 5 } },
            desc: "Presence +1, Persuasion +5. You were there.",
          });
      } catch (e) {
        /* */
      }
      try {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "Culture news, folks: Carnegie Hall is open for business! The Carnegie Consort premiered a symphony twenty-two years late, and I hear even the Plaza Society clapped. Somebody check on them.",
          );
      } catch (e) {
        /* */
      }
    }
  }
  // ---------- Dakota: crying, sealed door, Nanny ----------
  let cryT = 20;
  function tickDakota(dt, realDt) {
    if (!P.inCell("dakota")) return;
    const O = P.I("dakota"),
      p = G.player.pos;
    if (!F.cryHeard) {
      F.cryHeard = true;
      G.notify(
        "Somewhere far above you, a baby is crying. A woman's voice hums along, very softly.",
      );
    }
    if (F.nanny) return;
    cryT -= realDt;
    const onTop = p.y - O.y > 12;
    if (cryT <= 0) {
      cryT = onTop ? 25 : 60;
      G.notify(
        onTop
          ? "(From behind the boarded door at the end of the hall: a thin wail, and four notes of a lullaby.)"
          : "(A baby is crying, somewhere upstairs.)",
      );
      if (onTop) G.sfx.play("maniac_growl", { volume: 0.15, pitch: 2.2 });
    }
  }
  C.openHollis = function (silent) {
    const Sd = P.dakotaSealed;
    if (!Sd || Sd.open) return;
    Sd.open = true;
    F.hollisOpen = true;
    Sd.root.visible = false;
    try {
      G.world.removeCollider(Sd.col);
    } catch (e) {
      /* */
    }
    if (!silent) {
      G.sfx.play("door_open");
      G.notify(
        "The boards come away. The door swings open on a room that smells of talcum powder and twenty-two years.",
      );
      if (qStage("pu_nursery") === "open" || qStage("pu_nursery") === "key")
        qSet("pu_nursery", "source");
    }
  };
  C.nannyResolve = function (how) {
    const a = actor("pu_nanny");
    if (how === "hostile") {
      F.nanny = "hostile";
      if (a && a.setHostile) P.safe("hostile", () => a.setHostile(true));
      return;
    }
    F.nanny = how;
    if (how === "rest") {
      if (a)
        P.safe("rest", () => {
          if (G.actors.remove) G.actors.remove(a);
        });
      standing(10, "Let Nanny rest");
    }
    if (how === "agnes" && a) {
      const to = A("dakota", "agnes_parlour");
      if (to)
        G.fadeTransition(() => {
          P.safe("move", () => {
            a.pos.set(to.x + 1.2, to.y, to.z);
            if (a.home) {
              a.home.x = to.x + 1.2;
              a.home.z = to.z;
            }
          });
        }, 0.3);
    }
    if (qActive("pu_nursery")) qSet("pu_nursery", "report");
  };
  // ---------- Plaza: suite & presidential lock ----------
  C.rent = function () {
    F.rented = true;
    if (!has("pu_key_suite")) give("pu_key_suite", 1);
  };
  P.plazaSleep = function () {
    if (!F.rented && !has("pu_key_suite")) {
      G.notify(
        "This is Suite 610. Pemberton at the front desk rents it for 40 scrip a night.",
      );
      G.sfx.play("ui_error");
      return;
    }
    try {
      if (!G.isStub("rpg") && G.rpg.sleep) {
        G.fadeTransition(() => G.rpg.sleep(8, { owned: true }), 0.6);
        return;
      }
    } catch (e) {
      G.reportError("poi_uptown:sleep", e);
    }
    G.notify("You sleep in a four-poster bed for the first time in your life.");
  };
  C.openPresidential = function (silent) {
    const g = P.plazaGate;
    if (!g || g.open) return;
    g.open = true;
    F.presOpen = true;
    g.root.visible = false;
    try {
      G.world.removeCollider(g.col);
    } catch (e) {
      /* */
    }
    if (!silent) {
      G.sfx.play("door_open");
      G.notify(
        "The Presidential Suite. Nobody has been in here since 1967 — except, apparently, a very determined moth.",
      );
    }
  };
  // ---------- Carnegie dynamo ----------
  C.installPower = function () {
    if (F.dynamoOn) {
      G.notify("Dynamo No. 2 is humming happily.");
      return;
    }
    if (
      qStage("pu_encore") !== "dynamo" &&
      !has("pu_planetarium_cell") &&
      !has("dry_cell", 3)
    ) {
      G.notify("Dynamo No. 2. It needs a power cell — a big one.");
      return;
    }
    if (take("pu_planetarium_cell")) F.powerGiven = true;
    else if (has("dry_cell", 3)) {
      take("dry_cell", 3);
      F.powerGiven = true;
    } else {
      G.notify(
        "You need a power source: the Hayden planetarium cell, or three fission batteries.",
      );
      G.sfx.play("ui_error");
      return;
    }
    F.dynamoOn = true;
    G.sfx.play("hum_electric", { volume: 1 });
    G.notify(
      "Dynamo No. 2 coughs, sparks, and settles into a deep hum. Every lamp in Carnegie Hall comes on at once.",
    );
    try {
      if (!G.isStub("fx")) G.fx.sparks(P.anchor("carnegie_hall", "dynamo"));
    } catch (e) {
      /* */
    }
    xp(75, "Dynamo No. 2");
    if (P.carnegieConcert) P.carnegieConcert.group.visible = true;
    if (qStage("pu_encore") === "dynamo" || qStage("pu_encore") === "deliver")
      qSet("pu_encore", "concert");
  };
  C.setPatron = function (how) {
    F.patron = how || true;
    if (qStage("pu_heist") === "fence") qComplete("pu_heist");
  };
  // ---------- Tiffany: vault & breaker ----------
  let vaultAnim = 0;
  C.openVault = function (fromTerminal, silent) {
    const T = P.tiffany;
    if (!T || T.open) return;
    T.open = true;
    F.vaultOpen = true;
    try {
      G.world.removeCollider(T.leafCol);
    } catch (e) {
      /* */
    }
    if (silent) {
      T.leaf.rotation.y = 1.9;
      return;
    }
    vaultAnim = 0.001;
    G.sfx.play("cryo_door", { pos: T.leaf.position, volume: 0.9 });
    G.notify(
      fromTerminal
        ? "Somewhere below, a Mosler vault door rolls open."
        : "The bolts retract and the great round door swings open.",
    );
    if (!qDone("pu_heist")) {
      if (!qActive("pu_heist")) qStart("pu_heist", "take");
      else if (qStage("pu_heist") === "in") qSet("pu_heist", "take");
    }
  };
  function tickTiffany(dt, realDt) {
    const T = P.tiffany;
    if (!T) return;
    if (vaultAnim > 0 && vaultAnim < 1) {
      vaultAnim = Math.min(1, vaultAnim + realDt / 4);
      const e = 1 - Math.pow(1 - vaultAnim, 3);
      T.leaf.rotation.y = 1.9 * e;
    }
    if (!P.inCell("tiffany")) return;
    if (!F.heistStarted) {
      F.heistStarted = true;
      qStart("pu_heist", "in");
    }
    if (F.breakerOff || dt <= 0) return;
    const p = G.player.pos,
      H = T.hazard;
    T.sparkT -= realDt;
    if (T.sparkT <= 0) {
      T.sparkT = 0.35 + Math.random() * 0.8;
      P.safe("sparks", () => {
        if (!G.isStub("fx"))
          G.fx.sparks(
            new THREE.Vector3(
              H.x + (Math.random() - 0.5) * 6,
              H.y + 0.1,
              H.z + (Math.random() - 0.5) * 3,
            ),
          );
      });
    }
    if (
      Math.abs(p.x - H.x) < H.hx &&
      Math.abs(p.z - H.z) < H.hz &&
      p.y < H.y + 0.4
    ) {
      T.t -= realDt;
      if (T.t <= 0) {
        T.t = 0.5;
        P.safe("shock", () => {
          G.player.damage(7, { type: "energy", source: "hazard" });
          G.sfx.play("laser_impact", { volume: 0.6 });
          if (!G.isStub("fx"))
            G.fx.flash(
              new THREE.Vector3(p.x, p.y + 0.5, p.z),
              0x9ab8ff,
              2,
              0.12,
            );
        });
      }
    }
  }
  function tickHaggle() {
    /* heist: diamond picked up → next stage */
    if (qStage("pu_heist") === "take" && has("pu_atlas_diamond")) {
      qSet("pu_heist", "fence");
      xp(100, "The Atlas Diamond");
    }
    if (
      qStage("pu_omelette") === "egg" &&
      has("pu_ripjaw_egg") &&
      !F._eggNote
    ) {
      F._eggNote = true;
      G.notify("Chef Gaston at the Plaza will want to see this.");
    }
    if (qStage("pu_nursery") === "key" && has("pu_key_hollis"))
      qSet("pu_nursery", "open");
    if (qStage("pu_nursery") === "source" && P.inCell("dakota")) {
      const n = A("dakota", "nursery"),
        p = G.player.pos;
      if (
        n &&
        Math.hypot(p.x - n.x, p.z - n.z) < 6 &&
        Math.abs(p.y - n.y) < 2
      ) {
        qSet("pu_nursery", "nanny");
        G.notify(
          'The crying stops. A lamp clicks on. "Shh," says a voice. "She has only just gone down."',
        );
      }
    }
    if (
      qStage("pu_encore") === "gather" &&
      F.patron &&
      (F.scoreGiven || has("pu_score")) &&
      (F.powerGiven || has("pu_planetarium_cell") || has("dry_cell", 3)) &&
      !F._allNote
    ) {
      F._allNote = true;
      G.notify("You have everything Maestro Bell asked for.");
    }
  }

  // ------------------------------------------------------------------
  // interactables (built at initDone; positions from POI anchors)
  // ------------------------------------------------------------------
  function interactables() {
    const W = G.world;
    // AMNH projector cell
    const pj = A("amnh", "projector");
    if (pj)
      W.addInteractable({
        pos: pj.clone().add(new THREE.Vector3(0, 0.2, 0)),
        radius: 1.3,
        label: "Star Projector — Power Cell Housing",
        verb: "Remove Cell",
        priority: 0.5,
        enabled: () => !!(P.amnhShow && P.amnhShow.powered),
        onInteract() {
          if (!G.isStub("ui") && G.ui.confirm) {
            G.ui
              .confirm(
                "Remove the Mark IV cell? The planetarium will go dark for good.",
              )
              .then((ok) => {
                if (ok) takeCell();
              });
          } else takeCell();
        },
      });
    function takeCell() {
      const S = P.amnhShow;
      if (!S || !S.powered) return;
      S.powered = false;
      F.cellTaken = true;
      show = null;
      give("pu_planetarium_cell", 1);
      G.sfx.play("robot_death", { pos: S.pos, volume: 0.5 });
      G.notify(
        "The projector winds down with a long electric sigh. Eight thousand nine hundred stars go out.",
      );
    }
    // Dakota sealed door
    const sd = A("dakota", "sealed_door");
    if (sd)
      W.addInteractable({
        pos: sd.clone().add(new THREE.Vector3(0.4, 1.3, 0)),
        radius: 1.2,
        label: () => "Apartment 3B — Hollis (SEALED)",
        verb: () => (has("pu_key_hollis") ? "Unlock" : "Open"),
        priority: 0.8,
        locked: () =>
          has("pu_key_hollis") || P.lockIsOpen(P.LOCKS.dakota_3b.id)
            ? null
            : "Nailed shut & locked",
        enabled: () => !(P.dakotaSealed && P.dakotaSealed.open),
        onInteract() {
          if (!P.locksLive() && !has("pu_key_hollis")) {
            G.sfx.play("door_locked");
            G.notify(
              "The door is boarded shut and locked. The superintendent kept the key.",
            );
            return;
          }
          P.lockOpen(P.LOCKS.dakota_3b, () => C.openHollis());
        },
      });
    // Dakota music box
    const nb = A("dakota", "nursery");
    if (nb)
      W.addInteractable({
        pos: new THREE.Vector3(nb.x + 3.6, nb.y + 1.0, nb.z - 5.5),
        radius: 0.6,
        label: "Music Box",
        verb: "Wind",
        onInteract() {
          G.sfx.play("ui_select", { volume: 0.6 });
          G.notify(
            "The music box plays four tinny notes, over and over. A-D-A. A-D-A.",
          );
        },
      });
    // Plaza Presidential Suite
    const pg = P.plazaGate;
    if (pg)
      W.addInteractable({
        pos: pg.pos,
        radius: 1.2,
        label: "Presidential Suite",
        verb: "Open",
        priority: 0.8,
        locked: () => (P.lockIsOpen(P.LOCKS.pres_door.id) ? null : "Keypad"),
        enabled: () => !pg.open,
        onInteract() {
          P.lockOpen(P.LOCKS.pres_door, () => C.openPresidential());
        },
      });
    // Carnegie dynamo
    const dy = A("carnegie_hall", "dynamo");
    if (dy)
      W.addInteractable({
        pos: dy.clone().add(new THREE.Vector3(0, 1.4, -0.55)),
        radius: 1.4,
        label: () => (F.dynamoOn ? "Dynamo No. 2 (running)" : "Dynamo No. 2"),
        verb: () => (F.dynamoOn ? "Check" : "Install Cell"),
        priority: 0.6,
        onInteract: () => C.installPower(),
      });
    // Tiffany vault door + breaker
    const vd = A("tiffany", "vault_door");
    if (vd)
      W.addInteractable({
        pos: vd.clone().add(new THREE.Vector3(0, 1.8, -2.1)),
        radius: 1.6,
        label: "Mosler Vault Door",
        verb: () => (has("pu_key_tiffany_vault") ? "Unlock" : "Open"),
        priority: 0.8,
        locked: () =>
          has("pu_key_tiffany_vault") ||
          F.timelock ||
          P.lockIsOpen(P.LOCKS.vault.id)
            ? null
            : "Locked",
        enabled: () => !(P.tiffany && P.tiffany.open),
        onInteract() {
          if (F.timelock) {
            C.openVault(false);
            return;
          }
          if (!P.locksLive() && !has("pu_key_tiffany_vault")) {
            G.sfx.play("door_locked");
            G.notify(
              "The vault is sealed. A time lock, a keyhole — and no handle on this side.",
            );
            return;
          }
          P.lockOpen(P.LOCKS.vault, () => C.openVault(false));
        },
      });
    const br = A("tiffany", "breaker");
    if (br)
      W.addInteractable({
        pos: br.clone().add(new THREE.Vector3(0, 1.6, -0.25)),
        radius: 0.7,
        label: () =>
          F.breakerOff ? "Breaker Box (off)" : "Breaker Box (sparking)",
        verb: () => (F.breakerOff ? "Inspect" : "Cut Power"),
        onInteract() {
          if (F.breakerOff) {
            G.notify("Dead. The water in the corridor is just water now.");
            return;
          }
          F.breakerOff = true;
          G.sfx.play("robot_death", { volume: 0.4 });
          G.notify(
            "You throw the breaker. The water in the corridor stops crackling.",
          );
          xp(20, "Cut the power");
        },
      });
  }

  // ------------------------------------------------------------------
  // raider boss carries the vault key; the AMNH matriarch guards the eggs
  // ------------------------------------------------------------------
  let keyWait = 0;
  function tickKeys() {
    if (!P.inCell("tiffany") || G.isStub("actors")) {
      keyWait = 0;
      return;
    }
    const list = G.actors.list();
    let holder = null;
    for (const a of list) {
      if (!a || a.group !== "tiffany") continue;
      if (a._puKey) {
        holder = a;
        continue;
      }
      if (a.isBoss || a.name === "Raider Boss") {
        a._puKey = true;
        holder = a;
        try {
          a.inventory = a.inventory || [];
          a.inventory.push(["pu_key_tiffany_vault", 1]);
        } catch (e) {
          /* */
        }
      }
    }
    // Fallback (combat only crowns a boss for gangs of 3+ at level 5+): after 2 s in the cell with no boss,
    // the living raider closest to the throne becomes the Raider Boss and carries the key. Skipped once the
    // key is in the player's pockets or the vault is already open.
    if (holder || F.vaultOpen || has("pu_key_tiffany_vault")) return;
    keyWait += 0.5;
    if (keyWait < 2) return;
    const th = A("tiffany", "boss");
    if (!th) return;
    let best = null,
      bd = 1e9;
    for (const a of list) {
      if (
        !a ||
        a.dead ||
        !a.pos ||
        (a.group !== "tiffany" &&
          !(a.id && String(a.id).indexOf("pu_g_tif") === 0))
      )
        continue;
      if (a.type !== "raider" || a.pos.x < G.LAYOUT.INTERIOR_X_MIN) continue;
      const d = a.pos.distanceToSquared(th);
      if (d < bd) {
        bd = d;
        best = a;
      }
    }
    if (!best) return;
    best._puKey = true;
    best.isBoss = true;
    best.name = "Raider Boss";
    try {
      best.maxHp = Math.round((best.maxHp || 60) * 1.5);
      best.hp = best.maxHp;
      best.inventory = best.inventory || [];
      best.inventory.push(["pu_key_tiffany_vault", 1]);
    } catch (e) {
      /* */
    }
  }

  // ------------------------------------------------------------------
  // world state from flags (after a load / on reset)
  // ------------------------------------------------------------------
  function resetWorld() {
    const Sd = P.dakotaSealed;
    if (Sd && Sd.open) {
      Sd.open = false;
      Sd.root.visible = true;
      Sd.col = P.readd(Sd.col);
    }
    const g = P.plazaGate;
    if (g && g.open) {
      g.open = false;
      g.root.visible = true;
      g.col = P.readd(g.col);
    }
    const T = P.tiffany;
    if (T && T.open) {
      T.open = false;
      T.leaf.rotation.y = 0;
      T.leafCol = P.readd(T.leafCol);
    }
    if (P.amnhShow) {
      P.amnhShow.powered = true;
      P.amnhShow.active = false;
    }
    if (P.carnegieConcert) P.carnegieConcert.group.visible = false;
    show = null;
    concert = null;
    vaultAnim = 0;
  }
  function applyWorldState() {
    if (F.hollisOpen) C.openHollis(true);
    if (F.presOpen) C.openPresidential(true);
    if (F.vaultOpen) C.openVault(false, true);
    if (P.amnhShow) P.amnhShow.powered = !F.cellTaken;
    if (P.carnegieConcert) P.carnegieConcert.group.visible = !!F.dynamoOn;
  }
  /** Re-add a removed collider with the same box. */
  P.readd = function (c) {
    if (!c) return c;
    if (G.world.colliders.indexOf(c) >= 0) return c;
    return G.world.addCollider(
      c.cx,
      c.cz,
      c.hx * 2,
      c.hz * 2,
      c.minY,
      c.maxY,
      c.yaw,
      { tag: c.tag, surface: c.surface, walkable: c.walkable },
    );
  };

  // ------------------------------------------------------------------
  // lifecycle
  // ------------------------------------------------------------------
  P.onPreReady.push(() => {
    defineItems();
    defineTerminals();
    defineDialogue();
    defineQuests();
  });
  P.onReady.push(() => {
    interactables();
  });
  P.onReset.push(() => {
    resetWorld();
    F = DEF_STATE();
    cryT = 20;
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnAll();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnAll();
  });
  let slow = 0;
  P.tick.push((dt, realDt) => {
    tickShow(dt, realDt);
    tickConcert(dt, realDt);
    tickTiffany(dt, realDt);
    slow -= realDt;
    if (slow > 0) return;
    slow = 0.5;
    tickDakota(dt, 0.5);
    tickHaggle();
    tickKeys();
  });
  // Killing the Nanny while hostile / Agnes's quest bookkeeping
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "pu_nanny" && F.nanny !== "rest" && F.nanny !== "agnes") {
      F.nanny = "destroyed";
      if (qActive("pu_nursery")) qSet("pu_nursery", "report");
    }
  });
})();
