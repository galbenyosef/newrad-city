// play-inline-561 05 — title
// Lines 1106-1236 of readable/play-inline-561.pretty.js (statement-aligned).
  function ferryToLiberty() {
    const d = libertyDock();
    L.sfx("door_open");
    L.travel(
      d.x,
      d.y || 0,
      d.z,
      Math.atan2(-(G.LAYOUT.LIBERTY.x - d.x), -(G.LAYOUT.LIBERTY.z - d.z)),
      () => {
        L.notify(
          "The ferry noses up against Liberty Island's crumbling pier. Ossie is already turning back.",
        );
        G.events.emit("ferryArrived", "liberty");
      },
    );
  }
  L.ferryToLiberty = ferryToLiberty;
  /** Ossie's boat from his dialogue: during the main story's crossing (mq24) it is the crossing itself (Rose decides
   *  whether she comes, then Act IV lands you); otherwise the plain ferry ride. */
  function boardFerry() {
    if (Q.isActive("mq24") && L.ms && L.ms.crossing)
      L.ms.crossing.go(covenantSided() ? "lancers" : "ferry");
    else ferryToLiberty();
  }

  // ------------------------------------------------------------------
  // Terminals (teletypes)
  // ------------------------------------------------------------------
  L.hook("register", function () {
    if (G.locks && G.locks.register)
      for (const s of LOCKS) {
        try {
          G.locks.register(Object.assign({}, s));
        } catch (e) {
          /* */
        }
      }
    const MET_TERM = {
      title: "THE METROPOLITAN MUSEUM OF ART — SECURITY",
      header:
        "KNOX-GUARD SECURITY SYSTEMS, INC.\nMUSEUM STATUS: OPEN (EMERGENCY HOURS: 22 YEARS)",
      lock: { id: LOCK_MET.id, passcode: LOCK_MET.passcode },
      entries: [
        {
          title: "Security Log",
          text: 'MAR 5 1967 09:47 — Alert level RED. Patrolmen switched to "Exhibit Protection: Maximum."\nMAR 5 1967 09:48 — All patrons classified as potential art thieves.\nMAR 5 1967 09:49 — Situation resolved. Museum empty.\nMAR 6 1967 – PRESENT — Exhibit Protection: Maximum.',
        },
        {
          title: "Gallery 4 (Closed for Renovation)",
          text: 'Contents: "Know Your Enemy: The Soviet Arsenal." Features a decommissioned Soviet warhead (inert*).\n\n*Inert status last verified 1967. The Museum regrets any glowing. The Museum also regrets the choice of enemy.',
        },
        {
          title: ">> Engage MUSEUM CLOSED protocol",
          cond: () => !L.flag("met_closed"),
          action: () => {
            L.setFlag("met_closed");
            L.factionTruce("robots", MET.x, MET.z, 140, false);
            L.xp(50, "Electronics: Museum Closed");
            L.notify(
              "MUSEUM CLOSED. Security robots return to their charging alcoves and begin politely humming.",
            );
            if (
              Q.stage("sq_exhibit") === "security" ||
              !Q.isStarted("sq_exhibit")
            ) {
              if (!Q.isStarted("sq_exhibit")) Q.start("sq_exhibit");
              Q.setStage("sq_exhibit", "report");
            }
          },
        },
      ],
    };
    L.terminal("met_security", MET_TERM);
    L.terminal("met_curator", MET_TERM);
    L.terminal("city_hall_mayor", {
      title: "OFFICE OF THE MAYOR OF NEW YORK",
      header:
        'CITY OF NEW YORK — MUNICIPAL TELETYPE NETWORK\n"THE CITY THAT NEVER SLEEPS (CIVIL DEFENSE ADVISORY: PLEASE SLEEP IN A SHELTER)"',
      lock: { id: LOCK_CITY_HALL.id, passcode: LOCK_CITY_HALL.passcode },
      entries: [
        {
          title: "Mayor's Address (Draft 7)",
          text: "My fellow New Yorkers. Today the sirens sounded, and — [strike] — Today, the city faces — [strike] — New Yorkers do not panic. We complain. We complain loudly, and then we get to work. So complain, and then get to the nearest Civil Defense shelter, and then —\n\n[The draft ends mid-sentence. Time stamp: 03.05.1967 09:44.]",
        },
        {
          title: "Municipal Robotics — Service Log",
          text: 'PATROLMAN UNITS 1-6: "Civil Order Protocol" engaged 03.05.1967.\nDirective: preserve the Mayor\'s office until the Mayor returns.\nMayor status: NOT RETURNED.\nProjected return: PENDING.\n\nUnits remain on duty. Units will remain on duty.',
        },
        {
          title: "Office of Civil Defense — Memorandum",
          text: 'CITY OF NEW YORK / OFFICE OF CIVIL DEFENSE\nMEMORANDUM OF UNDERSTANDING: PROJECT LONG WINTER (CIVIC CENTER)\n\nThe City grants the Office subsurface rights beneath the Manhattan Municipal Building, in exchange for twelve (12) places in the program reserved for "municipal essential personnel."\n\nAppendix C (classified): the Office shall house Atlas Power & Light relay equipment in the facility\'s lowest level. The City shall not ask what it is for.\n\n[Handwritten: "Don\'t sign this." It is signed.]',
        },
        {
          title: ">> Order municipal robots to stand down",
          cond: () => !L.flag("cityhall_standdown"),
          action: () => {
            L.setFlag("cityhall_standdown");
            L.factionTruce("robots", 80, 625, 90, false);
            L.xp(40, "Municipal authority");
            L.notify(
              "CIVIL ORDER PROTOCOL SUSPENDED. The Patrolmen of City Hall lower their arms and wait for the Mayor.",
            );
          },
        },
      ],
    });
    L.terminal("flatiron_post", {
      title: "FLATIRON TRADING POST",
      header:
        'CALDWELL & DAUGHTERS / GUS PAPADAKIS — SHARED LEDGER\n"WE SPLIT THE RENT, NOT THE PROFITS"',
      entries: [
        {
          title: "Wagon Schedule",
          text: "Flatiron → Grand Central: Mon/Thu (Dolly)\nFlatiron → Brooklyn (via Bridge): SUSPENDED (Tony)\nFlatiron → Battery: when Ossie answers the radio",
        },
        {
          title: "Gus's Inventory Notes",
          text: 'Leather armour: 3 (one has a bullet hole — sell as "ventilated")\n.32 bolt rifles: 2 (one is missing its bolt)\nTin cans: 400 (why do I keep buying tin cans)',
        },
        {
          title: "Hattie — Personal",
          learn: LOCK_STRONGBOX.id,
          text: "Mom's locket is in the strongbox with the payroll. Combination is Mom's birthday, 0-4-1-9, same as every box this family has ever owned. If Ruiz loses that box I will walk to Brooklyn and back just to yell at him.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
