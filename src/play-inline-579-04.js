// play-inline-579 04 — title
// Lines 1660-1766 of readable/play-inline-579.pretty.js (statement-aligned).
  QX.hook("register", function () {
    QX.terminal("qx_term_c4_pumps", {
      title: "C-4 — HYDRAULICS & DRAINAGE",
      header: HDR + "STATION 3 — PLANT ROOM",
      entries: [
        {
          title: "Pump Status",
          text: () =>
            QX.flag("c4_pumps")
              ? "PUMP 1: RUNNING (84%)\nPUMP 2: RUNNING (61%) — BEARING NOISE\nLOWER LEVEL: DRAINED\nSEAWALL SEEPAGE: 2.1 L/MIN (NOMINAL, SOMEHOW)"
              : "PUMP 1: OFFLINE — IMPELLER SEIZED\nPUMP 2: OFFLINE — NO POWER\nLOWER LEVEL: FLOODED (3.2 M)\nSEAWALL SEEPAGE: 2.1 L/MIN\n\nLAST MAINTENANCE: 03.03.1967\nNEXT SCHEDULED MAINTENANCE: 03.10.1967",
        },
        {
          title: "Maintenance Log",
          learn: LOCKS.armory.id,
          text:
            "DAY 3 — Breach at the seawall coupling. Pump 1 handling it. Barely.\nDAY 5 — Pump 2 fuse box shorted when the water reached it. Nobody is to touch the fuse box. NOBODY, CHO.\n" +
            'DAY 6 — Changed the security cage combination to 3-7-0-9 after somebody "borrowed" a rifle to shoot at a crab. You know who you are.\n' +
            "DAY 8 — Pump 1 impeller seized. Generator room flooded. Pod coolant failing — Director ordered the emergency thaw.\nDAY 9 — Pressure door hydraulics under water. Director is recording a message.\n" +
            "DAY 12 — Maintenance crew leaving with the others. Sorry, Director. Somebody pull the impeller pin and give it a whack. That usually does it.",
        },
        {
          title: () =>
            QX.flag("c4_pumps") ? "Pumps: Running" : "Restart Pumps",
          cond: () => true,
          action: () => {
            if (QX.flag("c4_pumps")) return "The pumps are already running.";
            if (QX.skill(SK_MECH) >= 40 || QX.skill(SK_ELEC) >= 60) {
              V.drain();
              return "> PUMP 1 IMPELLER: FREED (MANUAL OVERRIDE)\n> PUMP 2 FUSE: BYPASSED\n> STARTING...\n> STARTING...\n> RUNNING.\n\nDRAINAGE IN PROGRESS.";
            }
            return "ERROR: PUMP 1 IMPELLER SEIZED. MANUAL SERVICE REQUIRED.\n\n[Mechanics 40 or Electronics 60 needed to override.]";
          },
        },
      ],
    });
    QX.terminal("qx_term_c4_qm", {
      title: "C-4 — QUARTERMASTER",
      header: HDR + "QUARTERMASTER STATION",
      entries: [
        {
          title: "Population",
          text: "FAMILY-UNIT PILOT (WHOLE HOUSEHOLDS, VOLUNTEERED TOGETHER)\nSLEEPERS IN POD: 58\nWATCH CREW: 3\nTOTAL: 61\n\nDAY 8: EMERGENCY THAW, ALL PODS. 58 REVIVED. 0 LOST.\nON SITE: 2\nDEPARTED VIA FREIGHT HATCH (DAY 12): 59\n\n[Later entries, typed with one finger:]\nDECEASED: 1 (YEAR 3) — ABERNATHY, M. — NATURAL CAUSES. RADIO LEFT ON AT HIS REQUEST.\nON SITE: 1",
        },
        {
          title: "Rations",
          text: "DAY 12: 59 PERSONNEL ISSUED 14 DAYS EACH. RIFLES: 20. MAP OF LOWER MANHATTAN: 1 (LAMINATED).\nREMAINING: 2 PERSONS x 400 DAYS.\n\n[Later:] REMAINING: 1 PERSON. RATIONS EXHAUSTED YEAR 4. (SEE PUMP ROOM — CRAB POTS. DO NOT ASK.)",
        },
        {
          title: "Door Codes",
          learn: [LOCKS.office.id, "qx_c4_dir_term"],
          text: "DIRECTOR'S OFFICE BULKHEAD (KEYPAD): 0-3-0-5 (DAY ONE. LEST WE FORGET)\nDIRECTOR'S TELETYPE PASSCODE (RESET DAY 40): WATCHKEEPER\nSECURITY CAGE: SEE PLANT ROOM LOG (CHO CHANGED IT AGAIN)\n\nDO NOT LEAVE THIS LIST ON THE QUARTERMASTER TERMINAL. — J.B.\n[Below:] SORRY DIRECTOR — D.C.",
        },
        {
          title: "Note to Self",
          text: "If anyone reads this — I kept the transmitter on because that's the job. The job is: somebody stays awake. I was the Director. I stayed.\n\n— J.B.",
        },
      ],
    });
    QX.terminal("qx_term_c4_director", {
      title: "FACILITY DIRECTOR BRANDT — PERSONAL",
      header: HDR + "DIRECTOR'S STATION — RESTRICTED",
      lock: {
        id: "qx_c4_dir_term",
        passcode: "WATCHKEEPER",
        label: "C-4 Director's Teletype",
        hint: "The quartermaster teletype in the pod hall keeps the passcode list.",
      },
      entries: [
        {
          title: "O.C.D. Memorandum C-4/67-B",
          text:
            "OFFICE OF CIVIL DEFENSE — BUDGET & FACILITIES (DIRECTOR'S EYES ONLY)\n\nRE: CRYO UNIT C-4, BATTERY PARK. The contractor's drainage plan for C-4 is rated for a " +
            "ten-year flood at mean high water. The engineering review recommends a second pump train and a seawall coupling of the heavier pattern.\n\n" +
            "Remediation is deferred to fiscal 1968. Site is to remain in service. Director is not to be troubled with the review.\n\n" +
            "[Below, typed into the annotation field:] I WAS TROUBLED WITH IT ON DAY 40, WHEN THE COURIER POUCH FINALLY DRIED OUT. I STAYED ANYWAY. MAKE A NOTE OF THAT, GENTLEMEN.",
        },
        {
          title: "Beacon Control",
          text: () =>
            QX.flag("c4_beacon_off")
              ? "BEACON: OFF\nLOOP COUNT AT SHUTDOWN: 461,906"
              : "BEACON: TRANSMITTING (91.7 MHZ)\nLOOP COUNT: 461,9##\nTAPE CONDITION: POOR (RE-RECORDED 11x)",
        },
        {
          title: "Personal Log — Year 2",
          text: 'The water stopped at the knee. It has been at the knee for a year. I am told that\'s called a "water table". Marcus says it\'s called "Tuesday".',
        },
        {
          title: "Personal Log — Year 9",
          text: "My hair is white now, and what is left of it comes out in the comb. Nine winters without daylight. I eat shellback six days a week. I think I am supposed to be dead. I am not dead. I think it is spite. Marcus would have made a joke. I miss Marcus's jokes, which I never laughed at.",
        },
        {
          title: "Personal Log — Pod 61",
          text: "They kept a pod for me. Sixty-one. Standing orders: the Director goes under last, when the watch is relieved. The watch has not been relieved. I check the seal every Sunday. It is very cold and very ready. Not yet.",
        },
        {
          title: "Personal Log — Year ???",
          text: "Stopped counting years. Kept counting days. The message says day nine. It seemed less embarrassing than the truth.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue — Facility Director Josephine Brandt
  // ------------------------------------------------------------------
