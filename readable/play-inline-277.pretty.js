/* src/poi_uws/80_content.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER WEST SIDE · 80 content
 * Items, notes & tape reels, terminals, dialogue, named NPCs, quests and
 * the scripted bits of the Ansonia, the San Remo and Bellamy's.
 *
 *  QUESTS
 *   uw_gardens  "The Hanging Gardens" (Adeline Crandall, San Remo commune) —
 *               bring down W.E.D. Stokes's seed bank from the Ansonia's
 *               rooftop farm (Old Stokes, a Maniac Bruiser, carries the key).
 *               The conservatory greens up.
 *   uw_window   "Window Shopping" (Birdie, the commune's sniper on the
 *               north tower) — her brother Toby was taken by the
 *               Mannequins to Bellamy's. Find him in the stockroom
 *               cage; free him (the Window Dresser's key, or the remote
 *               release on the manager's teletype); tell Birdie.
 *  LOCKS (P.LOCKS; every unlock is placed in this module)
 *   uw_ans_seedbank   key uw_key_stokes (Old Stokes carries it)
 *   uw_ans_safe       code 1904  the Ansonia management teletype
 *   uw_ans_manager    passcode GOATS  the Ansonia lobby teletype (residents board)
 *   uw_sr_office      passcode SEEDLING  the commune notice (San Remo lobby)
 *   uw_bl_manager     passcode DRESSUP      the Window Dresser's rules (Bellamy's)
 *   uw_bl_safe        code 1886  the Bellamy's manager teletype
 *   uw_bl_cage        key uw_key_cage (the Window Dresser) — or the manager teletype's remote release
 *  NPCs  Adeline Crandall · Mercer (trader) · Doc Halloway (doctor) · Birdie
 *        (sniper, north tower) · Augie (old doorman) · Nia (gardener) ·
 *        Toby Finch · two commune settlers.  Hostile: Old Stokes (Ansonia
 *        roof), the Window Dresser (Bellamy's raider boss, renamed).
 * All text original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._uw) return;
  const P = G._uw;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];
  P.tick = P.tick || [];

  // locks (read by the site builders in init; see the header for where each unlock lives)
  P.LOCKS = {
    ans_seedbank: {
      id: "uw_ans_seedbank",
      label: "Stokes Seed Bank",
      kind: "container",
      key: "uw_key_stokes",
      hint: "Old Stokes carries the key on the Ansonia roof.",
      keyFrom: "NPC: Old Stokes (Ansonia roof)",
    },
    ans_safe: {
      id: "uw_ans_safe",
      label: "Ansonia Office Safe",
      kind: "safe",
      code: "1904",
      hint: "The Ansonia management teletype.",
    },
    ans_manager: {
      id: "uw_ans_manager",
      label: "Ansonia Management Teletype",
      kind: "terminal",
      passcode: "GOATS",
      hint: "The residents board on the Ansonia front-desk teletype.",
    },
    sr_office: {
      id: "uw_sr_office",
      label: "San Remo Commune Ledger",
      kind: "terminal",
      passcode: "SEEDLING",
      hint: "The commune notice in the San Remo lobby.",
    },
    bl_manager: {
      id: "uw_bl_manager",
      label: "Bellamy's Store Manager Teletype",
      kind: "terminal",
      passcode: "DRESSUP",
      hint: "The Window Dresser's rules, nailed to the manager's desk.",
    },
    bl_safe: {
      id: "uw_bl_safe",
      label: "Manager's Safe",
      kind: "safe",
      code: "1886",
      hint: "The Bellamy's manager teletype.",
    },
    bl_cage: {
      id: "uw_bl_cage",
      label: "Hold Cage",
      kind: "door",
      key: "uw_key_cage",
      hint: "The Window Dresser carries the key; the manager teletype can release it.",
      keyFrom: "NPC: the Window Dresser (Bellamy's)",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);

  // ------------------------------------------------------------------
  // persistent state
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    bonus: false,
    niaGift: false,
    planted: false,
    seedsGiven: false,
    cageOpen: false,
    tobyFreed: false,
    tobyHome: false,
    birdieMet: false,
    adelineMet: false,
    gusTalks: 0,
    healed: 0,
    stokesDead: false,
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
      G.reportError("poi_uws:give", e);
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
      P.safe("sfx", () => G.sfx.play("ui_error"));
      return false;
    }
    if (G.inventory.addScrip) G.inventory.addScrip(-n);
    else take("scrip", n);
    P.safe("sfx", () => G.sfx.play("barter_trade"));
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
    if (!q) return;
    if (!q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => q.start(id));
    P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => {
        q.start(id);
        if (st) q.setStage(id, st);
      });
  };
  const qComplete = (id) => {
    const q = Q();
    if (q && !q.isComplete(id)) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
  const sfx = (n, o) => P.safe("sfx", () => G.sfx.play(n, o));
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
    // ---- Ansonia ----
    note(
      "uw_note_ans_fall",
      "Scrap of Paper",
      "Found beneath the grand staircase",
      "ELEVATOR OUT AGAIN. Taking the stairs to 14. Doctor says the exercise will do me good.\n\nIf found, please return this note to Mrs. R. Abelard, 14C, and tell her the doctor was wrong.",
    );
    note(
      "uw_note_seals",
      "Seal Keeper's Log",
      "The Ansonia — Lobby Fountain, Keeper's Book",
      'MAR 1 — Bartholomew off his feed again. Residents keep throwing him cocktail onions.\nMAR 3 — New seal delivered from the Coney Island aquarium, "Duchess". Bites.\nMAR 4 — Management asks if the seals can be taught to bark during fire drills. The seals already bark during fire drills. The seals bark during everything.\n' +
        "MAR 5 — Sirens. Doorman says the building is sealing. Nobody told me what to do about the seals. I am not leaving them.\n\n[much later, pencil] The water stopped. I gave them everything in the kitchen. Duchess still bites. Good girl.",
    );
    tape(
      "uw_reel_stokes",
      'Tape reel: "A Self-Sufficient Ansonia"',
      "W.E.D. Stokes III — address to the residents' board, 1966",
      "\"Gentlemen. My grandfather kept cows on this roof when the Board of Health said he couldn't. Chickens, geese, a bear, briefly. The papers laughed. Well, I have seen the Pentagon's projections, and nobody will be laughing at a man with his own eggs.\n\n" +
        "I propose we restore the farm. Raised beds, hydroponics, a seed bank — heirloom stock, sealed, the whole Eastern Seaboard's vegetable heritage in a steel box on our roof. If the worst happens, the Ansonia eats. Everybody else can eat their stock certificates. Motion to approve? ...Motion carried. Somebody fetch me a goat.\"",
    );
    note(
      "uw_note_baths",
      "Attendant's Note",
      "Pinned to a towel",
      "To whoever finds us: Leo and I came down to the Baths when the sirens started, same as every Sunday. Figured the deepest room in the building was the safest. The water went warm, then it went green. Leo says it's pretty. It is pretty.\n\nWe're going to sit by the pool a while. Please don't move us. We like the view.",
    );
    tape(
      "uw_reel_castellano",
      'Tape reel: "Castellano — Final Aria"',
      "Signor E. Castellano — home recording, 03/05/1967",
      '[A piano introduction, unsteady. A great tenor voice, older now, begins an aria of the clown who must go on laughing while his heart breaks. He does not reach the end. There is a long silence, then the sound of the piano lid closing.]\n\n"Two hundred performances and I always cracked on that note. Tonight I did not crack. Tonight there is no one to hear it. Of course. Of course that is how it goes."',
    );
    note(
      "uw_note_herman",
      'Letter to "Georgie"',
      "On league stationery, unsent",
      "Georgie —\n\nThe Commissioner says you can't keep the bat. The Hall says you can't keep the bat. The Yankees, frankly, would like the bat back and an apology for what you said on the radio.\n\nI say keep the bat. You hit sixty with it, you can hit a Commie with it. Keep it in the case and if the worst happens, you know where it is.\n\n— Mac\n\nP.S. Stop feeding the seals hot dogs.",
    );
    // ---- San Remo ----
    note(
      "uw_note_sr_notice",
      "Commune Notice",
      "Torn from the lobby notice board",
      "SAN REMO COMMUNE — HOUSE RULES\n1. Wipe your feet. Wipe your gun. Wipe your mouth.\n2. The elevator is for residents, guests and cargo. Not for \"joyrides\", DENNIS.\n3. Nobody goes to Bellamy's. NOBODY. The Mannequins are not a sale.\n4. Seeds, soil, anything that grows: bring it to Adeline. There's a reward.\n5. Birdie is on the north tower. If Birdie waves, wave back. If Birdie does not wave, take cover.\n6. The ledger teletype password is SEEDLING. It is a password so Dennis stops writing in the ledger, not because the ledger is secret.",
      { learn: "uw_sr_office" },
    );
    // ---- Bellamy's ----
    note(
      "uw_note_fitting",
      "Fitting Room Ticket",
      "Bellamy's — Fitting Room 4 — 3 items",
      "On the back, in a shaky hand: \"The man with the pins keeps asking what size I am. I told him I'm not buying anything. He says that's all right. He says I'll be on display. Toby if you read this, run.\"",
    );
    tape(
      "uw_reel_bride",
      'Tape reel: "Bridal Appointment, 10:30"',
      "Bellamy's Bridal Salon — customer dictation",
      "\"—the sweetheart neckline, the cathedral train, and the veil from the display. Yes, the display one. The wedding is Saturday. The sirens? Oh, they test them every month. ...That's not the test tone, is it. ...Well. I'm not taking it off. I waited three years for Harold to ask. If the world ends, it ends with me in this dress.\"",
    );
    note(
      "uw_note_memo",
      "Window Dresser's Rules",
      "Nailed to the manager's desk",
      "RULES OF THE HOUSE — by order of the WINDOW DRESSER\n\n1. Everybody gets a mannequin face. Faces are for customers.\n2. We do not sell. We DISPLAY.\n3. Anything that walks in off 59th Street is merchandise.\n4. The kid in the cage stays in the cage until he stops crying. Then he gets a window.\n5. Nobody touches my throne.\n6. Nobody touches the manager's teletype. (Password DRESSUP. The old manager wrote it on the blotter, under the slogan. The old manager is now in Housewares.)",
      { learn: "uw_bl_manager" },
    );
    // ---- keys / quest / uniques ----
    d({
      id: "uw_key_stokes",
      type: "key",
      name: "Stokes Farm Key",
      weight: 0,
      value: 0,
      noLoot: true,
      tags: ["key"],
      desc: 'A green-painted key on a leather thong: "SEED BANK — W.E.D.S."',
    });
    d({
      id: "uw_key_cage",
      type: "key",
      name: "Stockroom Cage Key",
      weight: 0,
      value: 0,
      noLoot: true,
      tags: ["key"],
      desc: 'A brass key tagged "STOCK — HOLD CAGE". Somebody has painted a tiny smiling face on it.',
    });
    d({
      id: "uw_seed_bank",
      type: "misc",
      name: "Stokes Heirloom Seed Bank",
      weight: 4,
      value: 400,
      quest: true,
      tags: ["quest"],
      desc: 'A welded steel case of sealed glass vials: beans, squash, tomatoes, corn, "Ansonia Greens". Two decades of patience in a box.',
    });
    d({
      id: "uw_mannequin_mask",
      type: "apparel",
      slot: "head",
      name: "Mannequin Mask",
      weight: 1,
      value: 120,
      dr: 2,
      attrs: { presence: -1 },
      skills: { stealth: 10 },
      tags: ["apparel", "hat", "unique"],
      desc: "A smooth, faceless plastic face with eye holes drilled out. Raiders find it unsettling. So does everybody else.",
    });
    d({
      id: "uw_greens",
      type: "aid",
      name: "Ansonia Greens",
      weight: 0.2,
      value: 12,
      sound: "eat",
      tags: ["food"],
      effects: { hp: 18, rads: -2 },
      desc: "Leafy, bitter, and grown from twenty-year-old seed on a penthouse floor. Tastes like hope and slightly like pennies.",
    });
    // unique weapons built from the weapons module's defs (fallback to misc if absent)
    const uniq = (id, baseId, name, value, desc, mod) =>
      d(
        (() => {
          const base = !G.isStub("items") ? G.items.get(baseId) : null;
          const w =
            base && base.weapon
              ? Object.assign({}, base.weapon, mod(base.weapon))
              : undefined;
          return {
            id,
            type: w ? "weapon" : "misc",
            name,
            weight: base ? base.weight : 3,
            value,
            unique: true,
            icon: base ? base.icon : undefined,
            desc,
            weapon: w,
          };
        })(),
      );
    uniq(
      "uw_sultan_bat",
      "baseball_bat",
      "The Sultan's Bat",
      700,
      "Forty ounces of Louisville ash, signed across the barrel by the man who hit sixty. Kept in a glass case at the Ansonia for twenty-two years. Swing it like you mean it.",
      (w) => ({
        damage: Math.round((w.damage || 14) * 1.6),
        critChance: 1.6,
        critMult: 1.5,
        condDecay: (w.condDecay || 0.002) * 0.5,
      }),
    );
    uniq(
      "uw_crows_nest",
      "hunting_rifle",
      "Crow's Nest",
      1100,
      "Birdie's father's rifle: a hunting rifle with a cheek rest carved from a San Remo banister and a scope she swears was once on a lighthouse. Steadier, deadlier, patient.",
      (w) => ({
        damage: Math.round((w.damage || 40) * 1.2),
        spread: (w.spread || 0.01) * 0.6,
        adsSpread: (w.adsSpread || 0.004) * 0.5,
        critChance: 2,
        condDecay: (w.condDecay || 0.002) * 0.6,
      }),
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
    T("uw_ans_desk", {
      title: "THE ANSONIA — FRONT DESK",
      header: "THE ANSONIA APARTMENT HOTEL\n2109 Broadway · Reception Telelink",
      entries: [
        {
          title: "Management Office",
          learn: "uw_ans_manager",
          text: "The management teletype is password-protected at Mr. Stokes's insistence. The password is GOATS. Mr. Stokes says nobody will ever guess it.",
        },
        {
          title: "Residents Board (02/1967)",
          text: "2A ... Mr. G. Herman (ret.)\n1A ... Signor E. Castellano (Metropolitan Opera)\n14C .. Mrs. R. Abelard\nPH ... W.E.D. Stokes III (Managing Partner)\n\nThe Baths (lower level) remain open to residents and guests. Management does not ask what happens in the Baths.",
        },
        {
          title: "Seal Feeding Schedule",
          text: '09:00 herring · 16:00 mackerel (residents may observe)\n\nNOTICE: Residents are reminded NOT to feed the seals hot dogs, cocktail onions, canapés or "the rest of this sandwich". This means you, Mr. Herman.',
        },
        {
          title: "Building Bulletin — 03/05/1967",
          text: "CIVIL DEFENSE ALERT. The Ansonia's walls are eighteen inches of masonry and were designed to keep Signor Castellano's rehearsals out of your apartment. They will keep the rest of it out too.\n\nResidents are asked to remain in their apartments. The roof is CLOSED. Mr. Stokes has gone up anyway.",
        },
        {
          title: "Maintenance Request #4471",
          text: 'Roof farm: the goats have eaten the irrigation hose again. Also a raincoat, two sun hats and an estimate from the plumber.\nStatus: ESCALATED TO MR. STOKES. Mr. Stokes says the goats are "residents in good standing".',
        },
      ],
    });
    T("uw_ans_manager", {
      title: "MANAGEMENT OFFICE",
      header: "STOKES & CO. PROPERTY MANAGEMENT\nThe Ansonia — Private",
      lock: P.LOCKS.ans_manager,
      entries: [
        {
          title: "Office Safe",
          learn: "uw_ans_safe",
          text: "Office safe: 1-9-0-4, the year the building opened. Mr. Stokes chose it. Mr. Stokes chooses everything.",
        },
        {
          title: "Memo: The Seed Bank",
          text: 'The heirloom seed bank arrived today from the Department of Agriculture\'s "National Larder" program — how Mr. Stokes obtained it, I decline to ask. It is locked in the strongbox in the roof greenhouse. Mr. Stokes keeps the only key ON HIS PERSON, "where it belongs".',
        },
        {
          title: "Re: Mr. Herman's Bat",
          text: "The League's lawyers have written again regarding the bat in apartment 2A. Mr. Herman has written back. We have been asked not to forward Mr. Herman's reply, as it contains language unsuitable for the mails.",
        },
        {
          title: "Personal Log — Night Manager",
          text: "Stokes won't come down off the roof. He's been up there four days. He says the farm needs him. He says he feels \"warm\". His hair's gone and he laughs at nothing, and last night he didn't know my name. The sick ones from the Baths, the ones who only scream now, won't go near the roof door. I think they're scared of him. I think I am too.",
        },
      ],
    });
    T("uw_ans_farm", {
      title: "STOKES FARM — GREENHOUSE",
      header: "ROOFTOP AGRICULTURAL STATION\nProperty of W.E.D. Stokes III",
      entries: [
        {
          title: "Farm Log",
          text: "Day 1: Everyone below is panicking. The tomatoes are not panicking.\nDay 9: Rain tastes of metal. Covered the beds.\nDay 30: Goats dead. Chickens dead. Beans alive! Beans are magnificent.\nDay 60: My hair has fallen out. The beans remain magnificent.\nDay 200: I sleep in the greenhouse now. I talk to the beans. Lately the beans talk back. I AM THE FARM.",
        },
        {
          title: "Seed Bank Inventory",
          text: "41 varieties, sealed, viable 300 yrs (manufacturer's claim).\nIncluding: Brandywine tomato, Cherokee bean, Ansonia Greens (proprietary), Hubbard squash, Stokes Yellow corn.\n\nKEY: on my person. Anyone who wants it can come and ask me for it. Politely.",
        },
        {
          title: "Irrigation Valve",
          text: "You open the valve. The pipes knock, cough, and deliver one cup of rust-coloured water onto a bed of dead beans. It is the most hopeful thing that has happened on this roof in twenty years.",
          action: () => {
            sfx("hum_electric", { volume: 0.4 });
          },
        },
      ],
    });
    T("uw_sr_lobby", {
      title: "SAN REMO — DOORMAN'S DESK",
      header: "THE SAN REMO · 145 CENTRAL PARK WEST\nLobby Telelink (Doorman)",
      entries: [
        {
          title: "Doorman's Log (abridged)",
          text: '03/05/1967 — Sirens. Told Mrs. Kestenbaum her dog could not ride in the service elevator. In retrospect, petty.\n03/06/1967 — Nobody came in. Nobody went out. Kept the door.\n...\n[entries continue daily for 8,000 lines]\n...\nToday — Birdie on the tower. Adeline wants seeds. Mercer overcharged a trade wagon. Doc says my liver is "remarkable". Kept the door.',
        },
        {
          title: "Commune Rules",
          text: "1. Everyone works.\n2. Everyone eats.\n3. Nobody sells anybody.\n4. Guns stay holstered below the 15th floor.\n5. Augie decides who comes in. Augie has decided for twenty-two years. Augie is very good at it.",
        },
        {
          title: "Elevator Service",
          text: 'CAR 1: IN SERVICE (generator, lobby east)\nCAR 2: OUT OF SERVICE since 1967 ("temporary").\nSTAIRS: collapsed at the 4th floor landing. Do not attempt. Dennis attempted.',
        },
      ],
    });
    T("uw_sr_office", {
      title: "COMMUNE LEDGER",
      header: "SAN REMO COMMUNE — A. CRANE\nPrivate",
      lock: P.LOCKS.sr_office,
      entries: [
        {
          title: "Population",
          text: "Residents: 31 (+1 if Toby comes home).\nRifles: 1 good, 4 bad, 1 Birdie.\nFood: 19 days at current rations. Pigeons do not count as a plan.",
        },
        {
          title: "The Garden Plan",
          text: "The conservatory gets eight hours of sun through the east glass. We have soil (hauled up from the park, bucket by bucket) and water (Mercer's purifier). What we don't have is anything worth planting.\n\nEvery old-timer on the West Side knows the story: Stokes and his seed bank on the Ansonia roof. Nobody's been up there in twenty years. Maniacs in the building, and something big up on the roof that howls at night.",
        },
        {
          title: "Re: Bellamy's",
          text: "The Mannequins took Toby Finch three days ago. Birdie wants to go after him. I can't let her — she's the only thing keeping the raiders off our door. I hate this ledger. I hate that the arithmetic is right.",
        },
      ],
    });
    T("uw_bl_pa", {
      title: "STORE ANNOUNCEMENTS",
      header: "BELLAMY'S · LEXINGTON AT 59TH\nPublic Address Console",
      entries: [
        {
          title: 'Recorded: "Atomic Home Sale"',
          text: '"Attention shoppers! Visit THE ATOMIC HOME on our third floor — the kitchen of tomorrow, today! Valet demonstrations hourly. Bellamy\'s: where New York dresses up."',
        },
        {
          title: "Recorded: Code Adam",
          text: '"Attention associates: Code Adam, Fashion floor. Code Adam. A small boy in a Civil Defense sweater has been separated from his mother near Bridal." [the tape repeats, degraded, for twenty-two years]',
        },
        {
          title: "Recorded: 03/05/1967",
          text: '"Attention shoppers. Please proceed calmly to the public shelter on the lower level. Please do not run. Please do not take the mannequins. Please— ...will someone please put that mannequin DOWN."',
        },
      ],
    });
    T("uw_bl_manager", {
      title: "STORE MANAGER",
      header: "BELLAMY'S — OFFICE OF THE STORE MANAGER\nAuthorized Personnel",
      lock: P.LOCKS.bl_manager,
      entries: [
        {
          title: "Office Safe",
          learn: "uw_bl_safe",
          text: "Manager's safe: 1-8-8-6, the year of the first store. Please memorise and destroy. (Do not destroy the teletype.)",
        },
        {
          title: "Memo: St. Patrick's Day Sale 1967",
          text: 'Projected foot traffic is DOWN 40% on account of "the end of the world". I remind department heads that the world has ended several times this year according to the radio and we still made our numbers.',
        },
        {
          title: "Personnel: Mr. Vane (Display)",
          text: 'Our senior window dresser, Mr. Percival Vane, has again been found sleeping in the 59th Street windows "to understand the mannequins". His windows remain the best on the avenue. HR recommends no action. HR is afraid of Mr. Vane.',
        },
        {
          title: "Security: Stockroom Hold Cage",
          text: 'HOLD CAGE (shoplifter detention), third floor stockroom.\nSolenoid lock, remote release from this console.\n\nNOTE: Mr. Vane has been using the hold cage for "display rehearsals". Security has been asked not to ask.',
        },
        {
          title: "> Release hold cage lock",
          text: "REMOTE RELEASE ... OK.\nSomewhere in the stockroom a solenoid clunks.",
          action: () => {
            P.safe("unlock", () => {
              if (P.locksLive()) G.locks.unlock(P.LOCKS.bl_cage.id);
            });
            if (!F.cageOpen) C.openCage(false);
          },
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
    // ---------------- Adeline Crandall ----------------
    R("dlg_uw_adeline", {
      start: () =>
        qDone("uw_gardens")
          ? "after"
          : qActive("uw_gardens")
            ? has("uw_seed_bank")
              ? "deliver"
              : "progress"
            : F.adelineMet
              ? "again"
              : "first",
      nodes: {
        first: {
          speaker: "Adeline Crandall",
          text: "You came up in the elevator, so Augie liked you, and you haven't shot anyone, so Birdie likes you. That's two votes. I'm Adeline Crandall. I run the commune, which mostly means I count beans. Or I would, if we had any beans.",
          onEnter: () => {
            F.adelineMet = true;
          },
          responses: [
            { text: "What is this place?", next: "place" },
            { text: "No beans?", next: "beans" },
            { text: "I'll leave you to your counting.", end: true },
          ],
        },
        again: {
          speaker: "Adeline Crandall",
          text: "Back again. Did you bring beans? No? Then sit, have some pigeon, and let me tell you about beans.",
          responses: [
            { text: "Tell me about the beans.", next: "beans" },
            { text: "What is this place?", next: "place" },
            { text: "Later.", end: true },
          ],
        },
        place: {
          speaker: "Adeline Crandall",
          text: "The San Remo. Twin towers, twenty-seven floors, the finest address on Central Park West, and for the last twenty years, the only building on the West Side where nobody eats anybody. Thirty-one of us. A generator, an elevator, a doctor, a trader, and a sniper. Civilisation, more or less.",
          responses: [{ text: "And the beans?", next: "beans" }],
        },
        beans: {
          speaker: "Adeline Crandall",
          text: "We have a conservatory with eight hours of sun, soil we hauled up from the park bucket by bucket, and clean water. What we don't have is seed. Everything that grows out there is irradiated, poisonous, or trying to eat you. But there's a story every West-Sider knows...",
          responses: [{ text: "Go on.", next: "story" }],
        },
        story: {
          speaker: "Adeline Crandall",
          text: "The Ansonia, down Broadway. Before the war an eccentric named Stokes put a farm on the roof — and a seed bank. Heirloom seed, sealed in steel, meant to last three hundred years. The building's full of Maniacs now, and people say old Stokes is still up on the roof, howling at the moon. Bring me that seed bank and this commune stops living on pigeons.",
          responses: [
            {
              text: "I'll get your seeds.",
              next: "accept",
              action: () => qSet("uw_gardens", "seeds"),
            },
            {
              text: "[Trade 35] Pigeons are cheap. Seeds aren't. What's it worth?",
              check: { skill: "trade", value: 35 },
              next: "pay",
              failNext: "payFail",
            },
            { text: "Not my problem.", end: true },
          ],
        },
        pay: {
          speaker: "Adeline Crandall",
          text: "Mercer would be proud of you. Fine: two hundred and fifty scrip from the commune fund, and a bed here any night you want it. That's everything we have that isn't nailed down, and most of what is.",
          onEnter: () => {
            F.bonus = true;
          },
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => qSet("uw_gardens", "seeds"),
            },
          ],
        },
        payFail: {
          speaker: "Adeline Crandall",
          text: "It's worth the gratitude of thirty-one hungry people and whatever the fund can spare. Take it or leave it — but take it.",
          responses: [
            {
              text: "All right. I'll go.",
              next: "accept",
              action: () => qSet("uw_gardens", "seeds"),
            },
          ],
        },
        accept: {
          speaker: "Adeline Crandall",
          text: "Thank you. The Ansonia's the Beaux-Arts pile with the green domes, south of here on the park side. The roof door is at the top of the big spiral staircase. And whatever glows up there — don't let it hug you.",
          responses: [{ text: "On my way.", end: true }],
        },
        progress: {
          speaker: "Adeline Crandall",
          text: "Any luck at the Ansonia? The seed bank should be in the roof greenhouse. Stokes kept the key on him, if the stories are right. Stokes also died twenty-two years ago, so the stories may be flexible.",
          responses: [{ text: "I'm working on it.", end: true }],
        },
        deliver: {
          speaker: "Adeline Crandall",
          text: 'Is that — oh. Oh, look at the vials. "Brandywine." "Cherokee bean." "Ansonia Greens"... I don\'t even know what those are. I\'m going to find out. Nia! NIA! Get the trowels!',
          responses: [
            {
              text: "It's all yours.",
              next: "thanks",
              action: () => C.deliverSeeds(),
            },
          ],
        },
        thanks: {
          speaker: "Adeline Crandall",
          text: () =>
            "We'll have the first greens in a month. You'll eat at our table any time you like — and here" +
            (F.bonus
              ? ", the scrip I promised, every one"
              : ", something for the road") +
            ". The San Remo remembers its friends.",
          responses: [{ text: "Grow something good.", end: true }],
        },
        after: {
          speaker: "Adeline Crandall",
          text: () =>
            F.planted
              ? "Go and look at the conservatory. Go on. I'll wait. ...Green! Actual green! I cried. Don't tell Birdie."
              : "The seeds are in. Now we wait, and water, and shoo pigeons.",
          responses: [{ text: "Take care, Adeline.", end: true }],
        },
      },
    });
    // ---------------- Birdie ----------------
    R("dlg_uw_birdie", {
      start: () =>
        qDone("uw_window")
          ? "after"
          : qStage("uw_window") === "report"
            ? "report"
            : qActive("uw_window")
              ? "progress"
              : F.birdieMet
                ? "again"
                : "first",
      nodes: {
        first: {
          speaker: "Birdie",
          text: "Don't move so fast up here, it's a long way down and I'm jumpy. I had you in my scope since Seventy-Second Street. You walk like somebody who's never been shot at from above. You'll learn.",
          onEnter: () => {
            F.birdieMet = true;
          },
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "Quite a view.", next: "view" },
            { text: "I'll leave you to it.", end: true },
          ],
        },
        again: {
          speaker: "Birdie",
          text: "You again. Keep low. What do you want?",
          responses: [
            { text: "Anything I can do?", next: "toby" },
            { text: "Quite a view.", next: "view" },
            { text: "Nothing.", end: true },
          ],
        },
        who: {
          speaker: "Birdie",
          text: "Birdie Finch. The commune's long gun. Raiders come up Central Park West, I send them back down it. Somebody's got to sit up here with the pigeons, and the pigeons are terrible shots.",
          responses: [{ text: "Seems quiet today.", next: "toby" }],
        },
        view: {
          speaker: "Birdie",
          text: "Best in the city. The whole park, the reservoir, midtown burning politely. And down there on Lexington — see the big \"B\" in the black circle? Bellamy's. That's where the Mannequins live.",
          responses: [{ text: "The Mannequins?", next: "toby" }],
        },
        toby: {
          speaker: "Birdie",
          text: "Raiders. They wear plastic faces and dress the dead up in the store windows. Three days ago they took my brother Toby. He went down to Lexington for a winter coat — a WINTER COAT — and they dragged him inside. I can't leave this tower. If I go, the commune's got no teeth.",
          responses: [
            {
              text: "I'll bring your brother back.",
              next: "accept",
              action: () => qSet("uw_window", "find"),
            },
            {
              text: "[Persuasion 40] What makes you think he's still alive?",
              check: { skill: "persuasion", value: 40 },
              next: "alive",
              failNext: "aliveFail",
            },
            { text: "Sorry. Not my fight.", end: true },
          ],
        },
        alive: {
          speaker: "Birdie",
          text: "Because I watch that building every night through this scope, and every night the lights go on in the third floor stockroom, and every night somebody in there bangs on metal. Three bangs, pause, three bangs. That's our signal. That's Toby.",
          responses: [
            {
              text: "Then I'll get him out.",
              next: "accept",
              action: () => qSet("uw_window", "find"),
            },
          ],
        },
        aliveFail: {
          speaker: "Birdie",
          text: "Because he has to be. Are you going to help or are you going to stand on my tower asking stupid questions?",
          responses: [
            {
              text: "I'll help.",
              next: "accept",
              action: () => qSet("uw_window", "find"),
            },
            { text: "Neither.", end: true },
          ],
        },
        accept: {
          speaker: "Birdie",
          text: "Bellamy's, Lexington at Fifty-Ninth. Main doors on Fifty-Ninth. He'll be up top — third floor, back of the store. Their boss calls himself the Window Dresser. Put him in a window for me. And... bring Toby home. Please.",
          responses: [{ text: "Count on it.", end: true }],
        },
        progress: {
          speaker: "Birdie",
          text: () =>
            F.tobyFreed
              ? "I saw the lights change in the stockroom. Is he out? Is he coming?"
              : "Third floor, back of Bellamy's. Three bangs, pause, three bangs. Go.",
          responses: [{ text: "Working on it.", end: true }],
        },
        report: {
          speaker: "Birdie",
          text: "He's home. He came up the elevator an hour ago, skinny as a rake and complaining about the coat he never got. I... here. My father's rifle. I've got the commune's gun; you take the family one. It shoots straighter than I do, and that's saying something.",
          responses: [
            {
              text: "Thank you, Birdie.",
              next: "thanks",
              action: () => C.finishWindow(),
            },
          ],
        },
        thanks: {
          speaker: "Birdie",
          text: "Don't thank me. Just keep your head down when you walk up Central Park West. I'll be watching your back from up here.",
          responses: [{ text: "See you around.", end: true }],
        },
        after: {
          speaker: "Birdie",
          text: "All quiet. Toby's learning to shoot. God help the pigeons.",
          responses: [{ text: "Stay sharp.", end: true }],
        },
      },
    });
    // ---------------- Toby ----------------
    R("dlg_uw_toby", {
      start: () => (F.tobyHome ? "home" : F.cageOpen ? "freed" : "caged"),
      nodes: {
        caged: {
          speaker: "Toby Finch",
          text: "You're not wearing a face. You're not one of them. Please — the lock, the lock. He keeps the key on his belt, the one on the throne. Or there's a switch in the manager's office, I heard them laugh about it. Please.",
          onEnter: () => {
            if (!qActive("uw_window") && !qDone("uw_window"))
              qSet("uw_window", "free");
            else if (qStage("uw_window") === "find") qSet("uw_window", "free");
          },
          responses: [
            { text: "Hang on. I'll get you out.", end: true },
            { text: "Who are you?", next: "who" },
          ],
        },
        who: {
          speaker: "Toby Finch",
          text: "Toby. Toby Finch, from the San Remo. My sister's Birdie — the sniper? I came for a coat. There were coats. There were also raiders. I should have gone to Sterling's.",
          responses: [{ text: "I'll get you out.", end: true }],
        },
        freed: {
          speaker: "Toby Finch",
          text: "It's open! It's — you did it. I know the back way, the freight stair, I watched them use it. I'm going home. Tell Birdie... no. I'll tell her myself.",
          responses: [
            {
              text: "Go. Stay low.",
              end: true,
              action: () => C.sendTobyHome(),
            },
          ],
        },
        home: {
          speaker: "Toby Finch",
          text: "Birdie hugged me so hard I think she cracked a rib. Worth it. I owe you. Also I still don't have a coat.",
          responses: [{ text: "Glad you're home.", end: true }],
        },
      },
    });
    // ---------------- Mercer (trader) ----------------
    R("dlg_uw_mercer", {
      start: "first",
      nodes: {
        first: {
          speaker: "Mercer",
          text: "Mercer's Emporium, formerly the Rosenthal Library, formerly books. Now: ammunition, water, pills, and anything with a resale value. I buy what you find and I sell what you need at a price that keeps the commune's generator running. Browse.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Heard any rumours?", next: "rumours" },
            { text: "Goodbye.", end: true },
          ],
        },
        rumours: {
          speaker: "Mercer",
          text: "Rumours cost extra. Kidding. Mostly. One: the Mannequins at Bellamy's have a boss who used to work there — before. Twenty-two years in the same job, and I thought my career was stuck. Two: the Ansonia's Baths glow in the dark; bring Prussian Blue. Three: the Dakota up the road sings at night. I don't go to the Dakota.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Thanks.", end: true },
          ],
        },
      },
    });
    // ---------------- Doc Halloway ----------------
    const healCost = 40,
      radCost = 70;
    R("dlg_uw_doc", {
      start: "first",
      nodes: {
        first: {
          speaker: "Doc Halloway",
          text: 'Sit, sit. Name\'s Halloway. I was a veterinarian\'s great-great-granddaughter and in this city that makes me a surgeon. What hurts? Don\'t say "everything". Everybody says "everything".',
          responses: [
            {
              text: "Patch me up. [" + healCost + " scrip]",
              next: "healed",
              cond: () => G.player && G.player.hp < G.player.maxHp,
              action: () => {
                if (pay(healCost)) {
                  G.player.heal(G.player.maxHp);
                  F.healed++;
                  sfx("inject");
                }
              },
            },
            {
              text: "Flush the radiation out. [" + radCost + " scrip]",
              next: "flushed",
              cond: () => G.player && G.player.rads > 0,
              action: () => {
                if (pay(radCost)) {
                  G.player.addRads(-1000);
                  sfx("iodine_tabs");
                }
              },
            },
            { text: "I'd like to buy supplies.", barter: true, end: true },
            { text: "I'm fine.", end: true },
          ],
        },
        healed: {
          speaker: "Doc Halloway",
          text: "There. Stitches, a tonic, and a lollipop I found in '71. Try not to get shot in the same place twice, it confuses the stitches.",
          responses: [{ text: "Thanks, Doc.", end: true }],
        },
        flushed: {
          speaker: "Doc Halloway",
          text: "That'll make you pee like a racehorse and glow a little less. Stay out of the Ansonia's Baths. Nobody listens. Stay out anyway.",
          responses: [{ text: "Thanks, Doc.", end: true }],
        },
      },
    });
    // ---------------- Augie (doorman) ----------------
    R("dlg_uw_gus", {
      start: () => (F.gusTalks++ > 0 ? "again" : "first"),
      nodes: {
        first: {
          speaker: "Augie",
          text: "Good evening. Welcome to the San Remo. I've been the doorman here since March the fifth, nineteen sixty-seven, one of the busier days on the job. The elevator's behind me. Guns holstered below fifteen, please. Wipe your feet.",
          responses: [
            { text: "Since 1967? That's twenty-two years.", next: "tenure" },
            { text: "Who lives here?", next: "who" },
            { text: "Thanks, Augie.", end: true },
          ],
        },
        again: {
          speaker: "Augie",
          text: "Evening. The elevator's working. Mostly. Hold the rail.",
          responses: [
            { text: "Who lives here?", next: "who" },
            { text: "Thanks.", end: true },
          ],
        },
        tenure: {
          speaker: "Augie",
          text: "Doormen don't retire, sir. We just get less attractive. I was forty and handsome that morning; I'm sixty-two and distinguished. The residents went down to the shelters and never came up. I kept the door. The commune moved in twenty years ago and asked if they could stay. I said they'd need references. They had none. I let them in anyway. Don't tell anyone.",
          responses: [{ text: "Your secret's safe.", end: true }],
        },
        who: {
          speaker: "Augie",
          text: "Miss Crandall runs things upstairs, in the office off the great room. Mercer trades in the old library. Doc Halloway keeps the clinic. And Miss Finch is on the north tower with the rifle — you'll hear her before you see her. Or you won't hear her, and that's worse.",
          responses: [{ text: "Got it.", end: true }],
        },
      },
    });
    // ---------------- Nia (gardener) + commune settlers ----------------
    R("dlg_uw_nia", {
      start: () => (F.planted ? "green" : "first"),
      nodes: {
        first: {
          speaker: "Nia",
          text: "Mind the beds. They're empty, but they're MY empty beds. Soil from Sheep Meadow, carried up twenty-seven floors a bucket at a time. Now all we need is something to put in it. Adeline says there's seed on the Ansonia roof. Adeline says a lot of things.",
          responses: [{ text: "I'll keep an eye out.", end: true }],
        },
        green: {
          speaker: "Nia",
          text: 'Look at them. LOOK at them. Bean sprouts, tomato starts, and whatever "Ansonia Greens" are — they grow like they\'re angry. Here, take a handful. First harvest goes to the one who fetched the seeds.',
          onEnter: () => {
            if (!F.niaGift) {
              F.niaGift = true;
              give("uw_greens", 3);
            }
          },
          responses: [{ text: "Thanks, Nia.", end: true }],
        },
      },
    });
    R("dlg_uw_settler", {
      start: () => ["a", "b", "c"][Math.floor(Math.random() * 3)],
      nodes: {
        a: {
          speaker: "Commune Settler",
          text: "Dinner's at eight. It's pigeon. Breakfast is also pigeon. There are rumours of beans.",
          responses: [{ text: "Enjoy.", end: true }],
        },
        b: {
          speaker: "Commune Settler",
          text: "Don't ride the elevator with Dennis. He hums.",
          responses: [{ text: "Noted.", end: true }],
        },
        c: {
          speaker: "Commune Settler",
          text: () =>
            F.tobyHome
              ? "You're the one who brought Toby home! Birdie hasn't missed a shot since. Not that she used to."
              : "Poor Birdie. She hasn't slept since they took her brother.",
          responses: [{ text: "Take care.", end: true }],
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
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    P.safe("quest:gardens", () =>
      q.define({
        id: "uw_gardens",
        name: "The Hanging Gardens",
        giver: "Adeline Crandall",
        location: "The San Remo",
        desc: "The San Remo commune has soil, water and sun in its penthouse conservatory — but nothing to plant. Adeline Crandall believes W.E.D. Stokes's old-world heirloom seed bank is still on the rooftop farm of the Ansonia.",
        stages: [
          {
            id: "talk",
            text: "Speak with Adeline Crandall in the San Remo penthouse.",
            markers: mk("san_remo", "adeline", "Adeline Crandall"),
          },
          {
            id: "seeds",
            text: () =>
              has("uw_seed_bank")
                ? "Bring the seed bank to Adeline Crandall at the San Remo."
                : "Recover the Stokes seed bank from the rooftop farm of the Ansonia (roof access: top of the grand spiral stair).",
            markers: () =>
              has("uw_seed_bank")
                ? mk("san_remo", "adeline", "Adeline Crandall")()
                : P.inCell("ansonia")
                  ? mk("ansonia", "roof_access", "Roof Access")()
                  : mk("ansonia", "seedbank", "Stokes Seed Bank")(),
          },
          {
            id: "return",
            text: "Bring the seed bank to Adeline Crandall at the San Remo.",
            markers: mk("san_remo", "adeline", "Adeline Crandall"),
          },
        ],
        rewards: {
          xp: 400,
          scrip: 100,
          items: [
            ["rally_tonic", 2],
            ["purified_water", 4],
          ],
          standing: 15,
        },
      }),
    );
    P.safe("quest:window", () =>
      q.define({
        id: "uw_window",
        name: "Window Shopping",
        giver: "Birdie",
        location: "Bellamy's",
        desc: "Birdie Finch, the San Remo's sniper, can't leave her tower. Her brother Toby was dragged into Bellamy's by the Mannequins, a raider gang led by the self-styled Window Dresser.",
        stages: [
          {
            id: "find",
            text: "Find Toby Finch inside Bellamy's (third floor, stockroom).",
            markers: () =>
              P.inCell("bellamys")
                ? mk("bellamys", "cage", "Toby Finch")()
                : mk("bellamys", "exterior_entrance", "Bellamy's")(),
          },
          {
            id: "free",
            text: "Free Toby from the stockroom cage (Average lock, the Window Dresser's key, or the manager's terminal).",
            markers: mk("bellamys", "cage_door", "Hold Cage"),
          },
          {
            id: "report",
            text: "Tell Birdie on the San Remo's north tower that Toby is free.",
            markers: () => {
              const a = actor("uw_birdie");
              return a
                ? [
                    {
                      npc: "uw_birdie",
                      label: "Birdie",
                      x: a.pos.x,
                      z: a.pos.z,
                    },
                  ]
                : mk("san_remo", "birdie", "Birdie")();
            },
          },
        ],
        rewards: {
          xp: 450,
          items: [
            ["uw_crows_nest", 1],
            ["ammo_308", 30],
          ],
          standing: 25,
        },
      }),
    );
  }

  // ==================================================================
  // NPCs
  // ==================================================================
  const NPCS = [
    {
      id: "uw_adeline",
      poi: "san_remo",
      at: "adeline",
      type: "human",
      name: "Adeline Crandall",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_uw_adeline",
      level: 7,
      barks: [
        "Beans. Everything comes back to beans.",
        "Welcome to the San Remo.",
      ],
    },
    {
      id: "uw_mercer",
      poi: "san_remo",
      at: "mercer",
      type: "human",
      name: "Mercer",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_uw_mercer",
      level: 6,
      weapon: "combat_shotgun",
      merchant: {
        scrip: 650,
        table: "merchant_general",
        extra: [
          ["ammo_10mm", 60],
          ["ammo_308", 30],
          ["ammo_12ga", 24],
          ["rally_tonic", 3],
          ["purified_water", 6],
          ["frag_grenade", 3],
          ["scrap_metal", 10],
        ],
      },
    },
    {
      id: "uw_halloway",
      poi: "san_remo",
      at: "doc",
      type: "human",
      name: "Doc Halloway",
      outfit: "doctor",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_uw_doc",
      level: 6,
      merchant: {
        scrip: 400,
        table: "merchant_doctor",
        extra: [
          ["rally_tonic", 6],
          ["prussian_blue", 4],
          ["iodine_tabs", 4],
          ["morphine_syrette", 2],
        ],
      },
    },
    {
      id: "uw_gus",
      poi: "san_remo",
      at: "gus",
      type: "human",
      name: "Augie",
      outfit: "settler",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_uw_gus",
      level: 8,
      faction: "settlers",
      barks: ["Wipe your feet.", "Evening.", "Elevator's behind me."],
    },
    {
      id: "uw_nia",
      poi: "san_remo",
      at: "nia",
      type: "human",
      name: "Nia",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_uw_nia",
      level: 4,
    },
    {
      id: "uw_settler1",
      poi: "san_remo",
      at: "npc1",
      type: "human",
      name: "Commune Settler",
      outfit: "settler",
      gender: "m",
      ai: "sit",
      dialogue: "dlg_uw_settler",
      level: 3,
      barks: ["Pigeon again.", "Evening."],
    },
    {
      id: "uw_settler2",
      poi: "san_remo",
      at: "npc2",
      type: "human",
      name: "Commune Cook",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_uw_settler",
      level: 3,
      barks: ["Soup's on. It's pigeon.", "Who took my ladle?"],
    },
    {
      id: "uw_settler3",
      poi: "san_remo",
      at: "npc3",
      type: "human",
      name: "Lobby Guard",
      outfit: "drifter",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_uw_settler",
      level: 5,
      weapon: "hunting_rifle",
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
  const hasItem = (id) => {
    try {
      return !G.isStub("items") && !!G.items.get(id);
    } catch (e) {
      return false;
    }
  };
  function spawnNPC(def, where) {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return null;
    const ex = actor(def.id);
    if (ex && !ex.removed && !ex.dead) return ex;
    const a = where || A(def.poi, def.at);
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
      home: { x: a.x, z: a.z, r: def.ai === "guard" ? 2.0 : 1.0 },
      dialogue: def.dialogue,
      essential: def.essential !== false,
      hostile: false,
      noRespawn: true,
    };
    if (def.outfit) sd.outfit = def.outfit;
    if (def.gender) sd.gender = def.gender;
    if (def.barks) sd.barks = def.barks;
    if (def.holdPos) sd.holdPos = true;
    if (def.weapon && hasItem(def.weapon)) sd.weapon = def.weapon;
    else if (def.ai === "guard" || def.ai === "sit") sd.weapon = "none";
    if (def.merchant)
      sd.merchant = {
        scrip: def.merchant.scrip,
        stock: stockFor(def.merchant),
        restock: 3,
      };
    return P.safe("spawn:" + def.id, () => G.actors.spawn(sd));
  }
  function spawnBirdie() {
    const a = spawnNPC({
      id: "uw_birdie",
      poi: "san_remo",
      at: "birdie",
      type: "human",
      name: "Birdie",
      outfit: "drifter",
      gender: "f",
      ai: "guard",
      holdPos: true,
      dialogue: "dlg_uw_birdie",
      level: 9,
      weapon: "sniper_rifle",
      barks: [
        "Keep low.",
        "Movement on Seventy-Second.",
        "Three bangs, pause, three bangs...",
      ],
    });
    if (a) {
      try {
        a.sight = Math.max(a.sight || 0, 140);
        a.accuracy = Math.max(a.accuracy || 1, 1.6);
      } catch (e) {
        /* */
      }
    }
  }
  function spawnToby() {
    if (actor("uw_toby")) return;
    const where = F.tobyHome
      ? A("san_remo", "toby_home")
      : A("bellamys", "cage");
    if (!where) return;
    spawnNPC(
      {
        id: "uw_toby",
        poi: "bellamys",
        at: "cage",
        type: "human",
        name: "Toby Finch",
        outfit: "settler",
        gender: "m",
        ai: F.tobyHome ? "guard" : "static",
        dialogue: "dlg_uw_toby",
        level: 3,
        barks: F.tobyHome
          ? ["I still need a coat."]
          : ["Help! Somebody!", "Three bangs, pause, three bangs..."],
      },
      where,
    );
  }
  function spawnHostiles() {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return;
    // Old Stokes — a Maniac Bruiser, still tending the dead farm on the Ansonia roof
    if (!F.stokesDead && !actor("uw_stokes")) {
      const a = A("ansonia", "boss_roof");
      if (a)
        P.safe("spawn:stokes", () =>
          G.actors.spawn({
            id: "uw_stokes",
            type: "maniac_bruiser",
            name: "Old Stokes",
            faction: "maniacs",
            level: 9,
            pos: { x: a.x, y: a.y, z: a.z },
            yaw: 0,
            ai: "guard",
            home: { x: a.x, z: a.z, r: 10 },
            hostile: true,
            noRespawn: true,
            inventory: [
              ["uw_key_stokes", 1],
              ["scrip", 35],
            ],
            onDeath: () => {
              F.stokesDead = true;
            },
          }),
        );
    }
    // two extra Maniacs in the Baths, two Mannequins guarding Fashion
    for (const [id, poi, at, type, name] of [
      ["uw_ans_maniac1", "ansonia", "spawn3", "maniac", "Maniac Bather"],
      ["uw_ans_maniac2", "ansonia", "pool", "maniac", "Maniac Bather"],
      ["uw_bl_raider1", "bellamys", "fashion", "raider", "Mannequin"],
      ["uw_bl_raider2", "bellamys", "stockroom", "raider", "Mannequin"],
    ]) {
      if (actor(id)) continue;
      const a = A(poi, at);
      if (!a) continue;
      P.safe("spawn:" + id, () =>
        G.actors.spawn({
          id,
          type,
          name,
          faction: type === "raider" ? "raiders" : "maniacs",
          level: type === "raider" ? 5 : 6,
          pos: { x: a.x, y: a.y, z: a.z },
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 6 },
          hostile: true,
          noRespawn: true,
        }),
      );
    }
    // Ansonia ambushes: a Maniac guarding Herman's den (2A, the unique bat), and two "corpses" that are
    // not dead — one sprawled on 1B's mattress pile under the hole, one at the splintered edge in 2B.
    for (const [id, at, dx, dz, dormant, lvl] of [
      ["uw_ans_den", "spawn6", 0, 0, false, 7],
      ["uw_ans_nest", "nest", 0.6, 0.4, true, 6],
      ["uw_ans_hole", "hole", 3.2, 2.8, true, 6],
    ]) {
      if (actor(id)) continue;
      const a = A("ansonia", at);
      if (!a) continue;
      const x = a.x + dx,
        z = a.z + dz;
      const ac = P.safe("spawn:" + id, () =>
        G.actors.spawn({
          id,
          type: "maniac",
          name: "Maniac",
          faction: "maniacs",
          level: lvl,
          pos: { x, y: a.y, z },
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x, z, r: dormant ? 8 : 5 },
          hostile: true,
          noRespawn: true,
        }),
      );
      if (ac && dormant)
        P.safe("dormant:" + id, () => {
          if (typeof ac.setState === "function") ac.setState("dormant");
          if (typeof ac.anim === "function") ac.anim("dead");
        });
    }
  }
  function spawnAll() {
    for (const d of NPCS) spawnNPC(d);
    spawnBirdie();
    spawnToby();
    spawnHostiles();
  }

  // ==================================================================
  // Scripted bits
  // ==================================================================
  // --- cage ---
  let cageCol = null,
    cageAnim = 0;
  function closeCage() {
    const c = P.bloomCage;
    if (!c) return;
    c.group.rotation.y = 0;
    cageAnim = 0;
    if (!cageCol) {
      const b = c.colBox;
      cageCol = G.world.addBox(b[0], b[1], b[2], b[3], b[4], b[5], {
        tag: "poi",
        walkable: false,
      });
    }
  }
  C.openCage = function (silent) {
    const c = P.bloomCage;
    if (!F.cageOpen) {
      F.cageOpen = true;
      if (!silent) {
        sfx("keypad_accept");
        sfx("door_open");
        G.notify("The hold cage swings open.");
        xp(25, "Opened the hold cage");
      }
    }
    if (cageCol) {
      try {
        G.world.removeCollider(cageCol);
      } catch (e) {
        /* */
      }
      cageCol = null;
    }
    if (c) cageAnim = silent ? 1 : Math.max(cageAnim, 0.001);
    if (
      qActive("uw_window") &&
      (qStage("uw_window") === "find" || qStage("uw_window") === "free")
    )
      qSet("uw_window", "free");
  };
  let tobyRunT = 0;
  C.sendTobyHome = function () {
    if (F.tobyFreed) return;
    F.tobyFreed = true;
    const a = actor("uw_toby");
    const ex = A("bellamys", "freight_top");
    if (a && ex) {
      P.safe("toby:run", () => {
        a.hostile && a.setHostile && a.setHostile(false);
        if (a.moveTo) a.moveTo(ex.x, ex.z);
      });
      tobyRunT = 7;
    } else tobyHome();
    if (!qDone("uw_window")) qSet("uw_window", "report");
    xp(50, "Freed Toby Finch");
    standing(10, "Freed a captive");
  };
  function tobyHome() {
    const a = actor("uw_toby");
    if (a) {
      try {
        G.actors.remove(a);
      } catch (e) {
        /* */
      }
    }
    F.tobyHome = true;
    spawnToby();
  }
  C.finishWindow = function () {
    qComplete("uw_window");
  };
  // --- garden ---
  C.deliverSeeds = function () {
    if (!take("uw_seed_bank")) return;
    F.seedsGiven = true;
    F.planted = true;
    if (F.bonus) give("scrip", 150);
    if (P.srGardenAlive) P.srGardenAlive.visible = true;
    qComplete("uw_gardens");
  };
  // --- boss hook from 90_main (Bellamy's raider boss) ---
  C.onBoss = function (key, a) {
    if (key !== "bellamys" || a._uwBoss) return;
    a._uwBoss = true;
    a.name = "The Window Dresser";
    try {
      a.inventory = a.inventory || [];
      a.inventory.push(["uw_key_cage", 1]);
    } catch (e) {
      /* */
    }
  };

  function interactables() {
    const W = G.world;
    // cage door (the Window Dresser's key, or the manager teletype's remote release)
    const cd = A("bellamys", "cage_door");
    if (cd)
      W.addInteractable({
        pos: new THREE.Vector3(cd.x - 0.3, cd.y + 1.2, cd.z),
        radius: 1.0,
        label: "Hold Cage",
        verb: () => (has("uw_key_cage") ? "Unlock" : "Open"),
        priority: 0.8,
        locked: () =>
          F.cageOpen || has("uw_key_cage") || P.lockIsOpen(P.LOCKS.bl_cage.id)
            ? null
            : "Locked",
        enabled: () => !F.cageOpen,
        onInteract() {
          if (!P.locksLive() && !has("uw_key_cage")) {
            sfx("door_locked");
            G.notify("Locked. A padlock the size of a fist.");
            return;
          }
          P.lockOpen(P.LOCKS.bl_cage, () => C.openCage(false));
        },
      });
    // the Toby signal: three bangs from the stockroom (flavour) handled in tick
    // garden planting fallback: if the player planted without Adeline's dialogue (no dialogue module)
    const gd = A("san_remo", "garden");
    if (gd)
      W.addInteractable({
        pos: new THREE.Vector3(gd.x, gd.y + 0.8, gd.z),
        radius: 2.0,
        label: "Commune Planters",
        verb: () =>
          F.planted
            ? "Inspect"
            : has("uw_seed_bank")
              ? "Plant Seeds"
              : "Inspect",
        priority: -0.2,
        onInteract() {
          if (F.planted) {
            G.notify(
              "Green shoots in every bed. Somebody has written names on little sticks.",
            );
            return;
          }
          if (has("uw_seed_bank") && G.isStub("dialogue")) {
            C.deliverSeeds();
            G.notify("You plant the Stokes seeds.");
            return;
          }
          G.notify(
            has("uw_seed_bank")
              ? "Adeline would want to see these first."
              : "Five beds of hauled-up soil. Nothing growing.",
          );
        },
      });
  }

  // ------------------------------------------------------------------
  // world state from flags (after a load / on reset)
  // ------------------------------------------------------------------
  function resetWorld() {
    closeCage();
    if (P.srGardenAlive) P.srGardenAlive.visible = false;
  }
  function applyWorldState() {
    if (F.cageOpen) C.openCage(true);
    else closeCage();
    if (P.srGardenAlive) P.srGardenAlive.visible = !!F.planted;
  }

  // ------------------------------------------------------------------
  // tick: cage swing, Toby's signal, boss renaming
  // ------------------------------------------------------------------
  let bangT = 6,
    bangN = 0;
  function tickCage(realDt) {
    const c = P.bloomCage;
    if (!c) return;
    if (cageAnim > 0 && cageAnim < 1) {
      cageAnim = Math.min(1, cageAnim + realDt * 0.8);
    }
    const target = F.cageOpen
      ? 1.9 * (cageAnim > 0 ? 1 - Math.pow(1 - cageAnim, 3) : 1)
      : 0;
    c.group.rotation.y = target;
    // Toby bangs on the bars: three, pause, three (only while caged and the player is in the store)
    if (!F.cageOpen && P.inCell("bellamys")) {
      bangT -= realDt;
      if (bangT <= 0) {
        const a = A("bellamys", "cage");
        if (a) sfx("melee_hit", { pos: a, volume: 0.5 });
        bangN++;
        bangT = bangN % 3 === 0 ? 5 : 0.45;
      }
    }
  }

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
    closeCage();
  });
  P.onReset.push(() => {
    resetWorld();
    F = DEF_STATE();
    tobyRunT = 0;
    bangT = 6;
    bangN = 0;
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
  P.tick.push((dt, realDt) => {
    P.safe("cage", () => tickCage(realDt));
    if (tobyRunT > 0) {
      tobyRunT -= realDt;
      if (tobyRunT <= 0) P.safe("toby:home", tobyHome);
    }
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "uw_stokes") F.stokesDead = true;
  });
  // picking up the seed bank advances the garden quest; starts it if the player found it first
  G.events.on("itemAdded", (id) => {
    if (id === "uw_seed_bank") {
      if (!qDone("uw_gardens")) qSet("uw_gardens", "return");
    }
  });
  void PI;
  void HP;
})();
