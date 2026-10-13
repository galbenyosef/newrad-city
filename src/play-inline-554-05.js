// play-inline-554 05 — title
// Lines 1054-1171 of readable/play-inline-554.pretty.js (statement-aligned).
  L.hook("register", function () {
    registerLocks();
    L.terminal("cov_rock", {
      title: "THE IRON COVENANT — ROCKEFELLER HOLD",
      header:
        'CHRONICLE TELETYPE — AUTHORIZED PERSONNEL\n"WHAT WE KEEP, KEEPS US"',
      lock: termLock(LOCKS.cov),
      entries: [
        {
          title: "Hold History",
          text: "Rockefeller Hold was founded when Lancer-Commander Stroud's column, sent down from the Covenant's mountain hold to recover old-world machines, found the Plaza empty, fortified it, and declined to go home. The Warden has sent four recall orders. Stroud has answered each with a one-word status report: \"Negative.\"",
        },
        {
          title: "Intel: Liberty Island",
          text: "Continuity presence on Liberty Island: est. 1 platoon, 2 Sky-Eye drones, 1 Rotorcraft (grounded — rotor damage). Commander: Col. Augustus Crane.\nObjective: old-world installation in the statue's torch. Office of Civil Defense / Atlas Power & Light joint project: KNICKERBOCKER.\nAssessment: if the Continuity is guarding it, it is a weapon.",
        },
        {
          title: "Memo: Wexler to Stroud",
          text: "Lancer-Commander — respectfully — the Atlas Power documents describe Knickerbocker as a RECLAMATION array. Atmospheric scrubbing. If even half the specifications are accurate it could end the ash-storms over Manhattan permanently.\n\nI understand the Charter. I also understand that we are standing in a city of people who breathe.\n\n— Archivist I. Wexler",
        },
        {
          title: "Memo: Stroud to Wexler",
          text: "Archivist — Noted. The Charter exists because every machine that could save the world has also been used to end it. We secure the Array first. We debate its use after there is no Continuity left to debate with.\n\n— H.S.",
        },
      ],
    });
    L.terminal("un_command", {
      title: "CONTINUITY FORWARD COMMAND — UN PLAZA",
      header:
        "UNITED STATES GOVERNMENT (CONTINUITY OF) — SECURE TELETYPE\nDATE: MARCH 1967 (EXTENDED BY EXECUTIVE ORDER)\nUNAUTHORIZED ACCESS IS A FEDERAL OFFENSE. TO CONFESS, FILE FORM 9-C IN TRIPLICATE.",
      lock: termLock(LOCKS.un),
      entries: [
        {
          title: "Standing Orders",
          text: "1. It is 1967. Personnel who state otherwise will report for re-orientation.\n2. The second sleeper from Cryo Unit C-9 is NOT to be engaged. We want him cooperative.\n3. Maintain the Sky-Eye broadcast net. The anthem plays on the hour.\n4. Report all Covenant movement on Fifth Avenue (in triplicate).",
        },
        {
          title: "Project Knickerbocker (Summary)",
          text: 'The Knickerbocker Atmospheric Reclamation Array ("the Torch") can be operated in two modes:\n\nRECLAMATION: region-wide scrubbing of airborne radioactive ash. Duration: permanent. Beneficiaries: everyone.\n\nSELECTIVE: reclamation field re-tuned against the 1967 Census rolls. Persons not enrolled: see Directive 7-A.',
        },
        {
          title: "Directive 7-A (Executive)",
          text: "The full text of Executive Directive 7-A is held on tape reel for Colonel Crane's eyes only. A copy is available for transfer below, in violation of every security protocol, because Specialist Ortiz forgot to lock the reel drive again. (Specialist Ortiz has been reported. In triplicate.)",
        },
        {
          title: ">> Copy Directive 7-A to tape reel",
          cond: () => !L.has("q_reel_directive_7a"),
          action: () => {
            L.give("q_reel_directive_7a", 1);
            L.xp(30, "Continuity secrets");
          },
        },
      ],
      onUnlock() {
        L.setFlag("un_terminal_opened");
      },
    });
    L.terminal("esb_observatory", {
      title: "EMPIRE STATE BUILDING — OBSERVATORY RELAY",
      header:
        "ATLAS POWER & LIGHT / WNYC TRANSMITTER CONTROL\n[Someone has taped a crayon drawing of a crown to the screen.]",
      lock: termLock(LOCKS.esb),
      entries: [
        {
          title: "Relay Status",
          text: "KNICKERBOCKER IGNITION CORE (UNIT 2): REMOVED FROM CRADLE.\nREMOVED BY: [no badge]\nRELAY CAPACITY: 0%\n\nNOTE: Core is live. Do not lick the core.",
        },
        {
          title: "KONG'S LOG (typed, one letter at a time)",
          text: "KONG FOUND TALKING BOX.\nKONG TYPES ON TALKING BOX.\nTALKING BOX DOES NOT TALK BACK. RUDE.\n\nKONG IS KING OF EMPIRE. KONG HAS SHINY ROCK. KONG NEEDS QUEEN.\n\nKONG ALSO NEEDS BIGGER CLUB. KONG ALREADY WROTE THAT IN BOOK. KONG WRITES IT AGAIN BECAUSE IT IS TRUE.",
        },
        {
          title: "Visitor Notice (1967)",
          text: "The Observation Deck is closed today for a special event: the dedication of the WNYC–Atlas Power Knickerbocker Relay. Visitors may view the ceremony on the lobby monitors. Refreshments will be served. Please do not ask about the refreshments.",
        },
      ],
    });
    L.terminal("nypl_catalog", {
      title: "NEW YORK PUBLIC LIBRARY — CATALOG",
      header:
        'NYPL CIRCULATION SYSTEM — TELETYPE LIBRARIAN v1.2\n"KNOWLEDGE IS FREE. LATE FEES ARE NOT."',
      entries: [
        {
          title: "Search: Fusion",
          text: () =>
            catalogRead() +
            '"Practical Cold Fusion, Vol. II" — REFERENCE — Location: Rose Main Reading Room, Table 12\nStatus: ON SHELF (22 years)',
        },
        {
          title: "Search: Exo-rig",
          text: () =>
            catalogRead() +
            '"Exo-rig Field Servicing Manual" — RESTRICTED (Army loan) — Location: Periodicals, Rm. 108\nStatus: ON SHELF. Note: Reader was a Private Nguyen. Private Nguyen is still in Rm. 108.',
        },
        {
          title: "Search: Rotorcraft",
          text: () =>
            catalogRead() +
            '"Rotorcraft for the Home Mechanic" — Location: Returns cart, main steps\nStatus: RETURNED (not re-shelved). Staff reminder: re-shelve the returns cart.',
        },
        {
          title: "Your Account",
          text: () =>
            "PATRON: " +
            String(hero()).toUpperCase() +
            "\nITEMS OUT: " +
            bookCount() +
            "\nLATE FEES OWED: " +
            bookCount() * 8030 +
            " scrip\n\nThe Library thanks you for your patronage.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
