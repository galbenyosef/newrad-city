// play-inline-438 03 — title
// Lines 291-457 of readable/play-inline-438.pretty.js (statement-aligned).
  function terminals() {
    const T = (PK.TERMINALS = PK.TERMINALS || {});
    T.ppk_term_parks = {
      title: "NYC DEPT. OF PARKS & RECREATION",
      header: "ARSENAL MAINFRAME — MAP ROOM STATION 2",
      entries: [
        {
          title: "Memo: Teletype Passwords",
          learn: "ppk_term_commish",
          text: 'FROM: Office Services\n\nThe Commissioner has asked that his personal teletype password be changed from "PASSWORD". It is now CHESTNUT, after the tree outside his window. Please stop guessing it.',
        },
        {
          title: "Memo: Our Friends in Olive Drab",
          text: "FROM: Commissioner R. Moss\nTO: All Arsenal Staff\nRE: Project N.O.A.H.\n\nAs of this morning the lower level of this building and the Zoo service tunnels are under the authority of the U.S. Army, Civil Defense Depot 14.\n\nThe Army's National Organism Archive Habitat — \"the Ark\" — will shelter the Zoo's collection in the event of an attack.\n\nStaff are reminded that the Ark is for ANIMALS. This is not a metaphor.\n\n— R.M.",
        },
        {
          title: "Curator's Objection (Dr. S. Whitcombe)",
          text: 'Randall,\n\nThe Army\'s "Formula N" is going into every feed, 40 mg per kilo. They will not tell me what is in it.\n\nGus has not slept in seventy-two hours. He watches the keeper door. The penguins have started walking in formation. The burrow rat colony has doubled in a month and the rats are the size of cats.\n\nI am formally objecting. Again.\n\n— Stanley',
        },
        {
          title: "Visitor Statistics, Q4 1966",
          text: 'Attendance: 212,440 (−18%)\nMost popular exhibit: California Sea Lions\nLeast popular exhibit: "Tomorrow\'s Wildlife" (Civil Defense sponsored)\nComplaints: 1,207 (see: "Tomorrow\'s Wildlife")\nLost children: 44 (found: 43 — see Security)',
        },
        {
          title: "Diorama Maintenance Log",
          text: "1:1000 scale Central Park model:\n— replaced 400 trees (removed by children)\n— replaced Belvedere Castle (removed by child)\n— removed the Commissioner's proposed Expressway (installed by the Commissioner, again)",
        },
      ],
    };
    T.ppk_term_commish = {
      title: "OFFICE OF THE COMMISSIONER",
      header: "R. MOSS — PERSONAL TERMINAL",
      lock: PK.LOCKS.commish_term,
      entries: [
        {
          title: "Log — February 22, 1967",
          text: "Colonel Hallett came by again with his binders. If I sign the Depot 14 agreement the Army covers the Parks budget for a decade. A DECADE. I would sell the sea lions for a decade.\n\nI did not have to sell the sea lions. I only had to sign.",
        },
        {
          title: "Log — March 4, 1967",
          text: 'Whitcombe will not stop calling. He says Formula N makes the animals "adapt" — faster, meaner, hungrier. Isn\'t that the point? Hallett says the world after the war will belong to whatever adapts.\n\nI asked him where the Commissioner of Parks goes, after the war. He laughed for a long time.',
        },
        {
          title: "Ark Control Override",
          text: "Override word for Ark Control is on file with Stanley and with me.\n\nIt is LEVIATHAN.\n\n(Note for the Colonel: a password is not supposed to be the name of the project's mascot.)",
          action: () => {
            if (!K.has("ppk_noah_password")) {
              K.give("ppk_noah_password", 1);
              return "[Password copied to your goggles.]";
            }
            return "";
          },
        },
        {
          title: "Unlock Wall Safe",
          cond: () => !PK.flag("commish_safe_open"),
          learn: "ppk_commish_safe",
          action: () => {
            PK.setFlag("commish_safe_open", true);
            PK.safe("unlock", () => {
              if (PK.locksLive()) G.locks.unlock(PK.LOCKS.commish_safe.id);
            });
            const n = PK.unlockTagged("cp_zoo_arsenal", "commish_safe");
            K.sfx("keypad_accept");
            return n
              ? "> SAFE RELEASED."
              : "> RELAY CLICKS. (Nothing happens.)";
          },
          text: "> Sending release signal... (combination on file: 1934)",
        },
      ],
    };
    T.ppk_term_army = {
      title: "U.S. ARMY — CIVIL DEFENSE DEPOT 14",
      header: "DUTY TERMINAL — AUTHORIZED PERSONNEL",
      entries: [
        {
          title: "Orders 14-A",
          text: "Depot 14 will receive, shelter and sustain the specimens listed in Annex N.\n\nPersonnel will NOT enter the Ark after seal except to service the feeders.\n\nFormula N will be administered in all feeds at 40 mg/kg.\n\nIn the event of civilian attempts to enter the Ark: see Order 2.",
        },
        {
          title: "Duty Log — Sgt. Ruiz",
          text: "MAR 5 09:41 — Sirens. Radio says it's real.\n09:47 — Zoo staff on the stairs with families. Lt. Nwosu went down to talk to them.\n09:52 — Blast door sealed. The Lt. is on the other side. I don't know which side is the lucky one.\n\nI'm writing this down so it's written.",
        },
        {
          title: "Annex N — Specimen Manifest",
          text: 'P-1  Ursus maritimus ("GUS") ........ PRIORITY\nP-7  Panthera uncia ................. PRIORITY\nR-3  Heterocephalus glaber (colony, ~300) PRIORITY (?)\nA-9  Heloderma suspectum\nB-1  Ursus americanus (Bronx transfer)\nS-4  Zalophus californianus (pup)\nTZ   Tropic Zone insect house: Pandinus imperator, 60 specimens\n\nNOTE FROM THE LT.: Why are the naked burrow rats priority? Nobody can tell me.',
        },
      ],
    };
    T.ppk_term_noah = {
      title: "PROJECT N.O.A.H. — ARK CONTROL",
      header: "NATIONAL ORGANISM ARCHIVE HABITAT · DEPOT 14",
      lock: PK.LOCKS.noah_term,
      onUnlock: () => {
        if (q.active(QF) && (q.stage(QF) === "zoo" || q.stage(QF) === "ark"))
          q.set(QF, "deal");
      },
      entries: [
        {
          title: "Ark Status",
          text: () =>
            "BIOME A  TROPIC ...... BREACHED\nBIOME B  POLAR ....... " +
            (PK.flag("gates_open") ? "OPEN" : "SEALED") +
            "\nNIGHT HOUSE ........... OPEN\nFEEDING  AUTOMATIC ... " +
            (PK.flag("feeders_on")
              ? "ACTIVE (SUBSTITUTE STOCK: CULTURED PROTEIN)"
              : "SUSPENDED — FORMULA N STOCK DEPLETED 1969") +
            "\nGENERATOR ............ 61% (DIESEL / BATTERY BANK)\n\nSPECIMENS DETECTED: 9  (EXPECTED: 7)",
          action: () => {
            if (
              q.active(QF) &&
              (q.stage(QF) === "zoo" || q.stage(QF) === "ark")
            )
              q.set(QF, "deal");
            return "";
          },
        },
        {
          title: 'Specimen File: P-1 "GUS"',
          text: "Ursus maritimus. Male. Admitted 1962.\n\nFormula N response: EXCEPTIONAL. Mass +40%. Photophobia. Pigment loss (patchy). Cortisol off the chart. Subject no longer sleeps.\n\nKeeper's note (S.W.): He paces the same figure-eight he paced in 1964. He was the most neurotic bear in America and I loved him. Somebody, please, just feed him.",
        },
        {
          title: "RESUME AUTOMATED FEEDING",
          cond: () => !PK.flag("feeders_on") && !PK.flag("gates_open"),
          text: "> Formula N stock: 0 kg\n> Switching hoppers to substitute stock (cultured protein tanks, 71% capacity)...\n> Hopper B-1 ... OPEN\n> Hopper A-3 ... OPEN\n> Night House troughs ... OPEN\n\nFEEDING RESUMED.",
          action: () => {
            PK.park.restartFeeders();
            return "";
          },
        },
        {
          title: "EVACUATION: OPEN ALL HABITAT GATES",
          cond: () => !PK.flag("gates_open") && !PK.flag("feeders_on"),
          text: "> WARNING: THIS WILL RELEASE ALL SPECIMENS INTO THE PARK.\n> Confirmed.\n> Surface gates ... OPEN\n\nEVACUATION COMPLETE. GOOD LUCK, NEW YORK.",
          action: () => {
            PK.park.openGates();
            return "";
          },
        },
      ],
    };
    T.ppk_term_tavern = {
      title: "TAVERN ON THE GREEN",
      header: "RESERVATIONS · CATERING · SPECIAL EVENTS",
      entries: [
        {
          title: "Roz's Safe",
          learn: "ppk_roz_safe",
          text: "Note to self: the office safe is 0-6-1-9, Mama's birthday. If Buck is reading this — Buck, I will know.",
        },
        {
          title: "Reservations — Sunday, March 5, 1967",
          text: '12:00  Van Buren, party of 6 (anniversary — champagne on arrival)\n13:30  Mayor\'s office, party of 12 (Crystal Room, NO PRESS)\n19:00  Mr. Sinatra (Las Vegas) — DECLINED BY GUEST, "prior engagement"\n20:00  The Hendersons, party of 4 (window table, birthday cake)\n21:00  Civil Defense Regional Sales — the whole Crystal Room — PAID IN FULL',
        },
        {
          title: "Roz's Log — The Pen",
          text: "Three pack oxen gone in two weeks. Buck says the tracks come in over the East Drive from the zoo. Last night he saw it: white, big as a car, pink skin showing through the fur like it was sunburnt.\n\nNothing comes out of the zoo. Everybody knows that. People go IN.\n\nIf I don't fix this the trade wagons stop coming, and if the trade wagons stop coming the lights go out.",
        },
        {
          title: "Generator Log",
          text: 'Fuel: 3 weeks\nBulbs replaced this month: 212\nComplaints about "too many lights": 1 (Anton)\nMy answer: This is Tavern on the Green. The lights stay on.',
        },
      ],
    };
  }

