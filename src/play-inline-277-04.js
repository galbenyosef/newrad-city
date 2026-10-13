// play-inline-277 04 — title
// Lines 479-649 of readable/play-inline-277.pretty.js (statement-aligned).
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
