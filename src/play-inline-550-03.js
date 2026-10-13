// play-inline-550 03 — title
// Lines 554-894 of readable/play-inline-550.pretty.js (statement-aligned).
  function spawnRoaches() {
    if (!C.roach || G.isStub("actors") || !Q.isActive("mq01")) return;
    ROACH_IDS.forEach((id, i) => {
      if (L.flag("dead_" + id)) return;
      const a = (i / 3) * Math.PI * 2;
      L.spawnNPC({
        id,
        type: "giant_roach",
        name: "Giant Roach",
        faction: "creatures",
        level: 1,
        hostile: true,
        ai: "wander",
        noRespawn: true,
        hp: 12,
        damage: 2,
        at: {
          fallback: {
            x: C.roach.x + Math.cos(a) * 1.6,
            z: C.roach.z + Math.sin(a) * 1.6,
            y: C.roach.y,
          },
          maxR: 5,
        },
        home: { x: C.roach.x, z: C.roach.z, r: 5 },
      });
    });
  }
  // Walking into the maintenance corridor early wakes the roaches too.
  L.trigger({
    id: "cryo_roach_nest",
    r: 12,
    pos: () => C.roach || null,
    cond: () => Q.isActive("mq01") && roachesLeft() > 0 && L.inInterior(),
    fire: spawnRoaches,
  });

  function onRoachKilled(actor) {
    if (!actor || ROACH_IDS.indexOf(actor.id) < 0) return;
    L.setFlag("dead_" + actor.id);
    if (roachesLeft() === 0) {
      L.xp(15, "Pest control");
      advance();
    } else if (Q.stage("mq01") === "roaches") L.refresh("mq01");
  }

  /** The blast door code reached the player (terminal entry or desk note). */
  function learnCode(source) {
    if (locksLive() && G.locks.learn)
      safeCall("learn", () =>
        G.locks.learn(LOCK_ID, source || "Director Calloway"),
      );
    if (!L.flag("cryo_code_known")) {
      L.setFlag("cryo_code_known");
      L.hint(
        "codes",
        "Codes you find are logged in your goggles under NOTES → CODES.",
        1,
      );
    }
  }
  function readLogs(source) {
    learnCode(source);
    if (!L.flag("cryo_logs_read")) {
      L.setFlag("cryo_logs_read");
      L.xp(10, "Director Calloway's logs");
    }
    advance();
  }

  /** The blast door has opened (keypad, cheat, map, or the fallback keypad). */
  function onBlastOpen() {
    if (L.flag("cryo_blast_open")) {
      advance();
      return;
    }
    L.setFlag("cryo_blast_open");
    if (!(mapLive() && typeof G.map.openBlastDoor === "function")) {
      L.sfx("cryo_alarm", { volume: 0.5 });
      L.later(0.5, () => L.sfx("cryo_door"));
    }
    L.notify(
      "The blast door rolls aside on its track. Cold air comes down the service stair, smelling of rain and rust.",
    );
    if (G.player && G.player.shake) G.player.shake(0.25, 1.6);
    G.events.emit("blastDoorOpened");
    advance();
  }
  /** Fallback keypad (only while the map has no blast door of its own). */
  function useFallbackKeypad() {
    if (blastOpen()) {
      L.notify("The blast door is already open.");
      return;
    }
    const spec = {
      id: LOCK_ID,
      label: "C-9 Blast Door",
      code: CODE,
      kind: "door",
      hint: "Director Calloway's terminal and desk note",
    };
    if (locksLive() && G.locks.open) {
      safeCall("locks.open", () => G.locks.open(spec, () => onBlastOpen()));
      return;
    }
    if (codeKnown()) {
      L.sfx("keypad_accept");
      onBlastOpen();
    } else {
      L.notify("The keypad wants a four-digit code.");
      L.sfx("keypad_deny");
    }
  }
  L.cryo = { spots: C, openBlastDoor: onBlastOpen, custodian, learnCode };

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
  const LOGS = [
    {
      title: "LOG 1967-02-20 — Seal Day",
      text:
        "Forty volunteers under by 2200 hours. Forty pods green. The volunteers were very brave and very polite and asked a great many " +
        "questions about the coffee. I told them there would be coffee when they woke. I believe that is the first thing I have lied about in this job.\n\n" +
        'Ninety-day trial. Scheduled thaw: 21 May. Snow on the steps of the Municipal Building when the staff came in tonight. CUSTODIAN performing within tolerances. It has started calling me "Director" ' +
        'instead of "Doctor." I have not corrected it.',
    },
    {
      title: "LOG 1967-03-05 — The Teletype",
      text:
        "Priority traffic since dawn from the Office of Civil Defense: bombers inbound. Not over the Pole, where every " +
        "drill for twenty years said they would come. From the east. From Europe. The last line on the tape before it ran out said the city had " +
        "been hit to the north — the Bronx line, Yonkers. Then the line went dead.\n\nThe building shook once, at 9:47 on a Sunday morning, day fourteen of ninety. The pods " +
        "did not notice. I envy them.",
    },
    {
      title: "LOG 1968-03-02 — Silence",
      text:
        "Washington has been silent since March. Albany is silent. Our relay to Liberty Island answers with a carrier tone and " +
        "nothing else. Staff vote: we hold. The volunteers signed up to sleep through the worst of it. This is the worst of it.\n\nWe are going into " +
        "the staff pods on a rotation. CUSTODIAN will wake one of us if anything fails.",
    },
    {
      title: "LOG 1974-08-19 — Pod 3",
      text:
        "Pod 3 failed during my thaw. Coolant seal. There was nothing to be done and I did it anyway for six hours.\n\n" +
        'CUSTODIAN has asked whether it should "reallocate Pod 3\'s power budget." I said yes. I am going to say yes to that question a great many times, ' +
        "I think.",
    },
    {
      title: "LOG 1975-02-20 — The Service Door",
      text:
        "Someone leaves a candle at the service door every twentieth of February. Protocol forbids me to open it.\n\n" +
        "I have the periscope on the outer step. This year I timed it: just after three in the morning, a coat, a hood, a lantern. Three knocks. A long wait. Then the candle, and the footsteps going away. " +
        "Eight years now. I have stopped telling CUSTODIAN to log it. It logs it anyway.\n\nThe twentieth of February. The day we went under. Whoever it is, they are not knocking for me.",
    },
    {
      title: "LOG 1981-01-06 — Roll Call",
      text:
        "Pods 11, 14, 20, 21 and 30 since my last thaw. I read their names into the log because nobody else will.\n\n" +
        "Twelve pods green. The staff pods are down to mine. Dr. Okafor did not wake in July. I have stopped scheduling thaw drills; there is no " +
        "one left to drill.",
    },
    {
      title: "LOG 1988-11-30 — The Continuity",
      text:
        "The Liberty relay woke up tonight and printed a teletype on the old federal header:\n\n" +
        '"ALL FEDERAL INSTALLATIONS. THE CONTINUITY OF GOVERNMENT IS PRESERVED. ACTING PRESIDENT MARSH ADDRESSES THE NATION AT 1900. ALL ' +
        'CIVIL DEFENSE ASSETS, PERSONNEL AND SLEEPERS ARE TO REPORT TO LIBERTY STATION. NAMES ARE BEING READ. DATE: MARCH 7, 1967."\n\n' +
        "It is not March 1967. Somebody out there believes it is. I have not answered.",
    },
    {
      title: "LOG 1989 — Pod 9, Marlow",
      text:
        "Pod 9 thawed early on a fault, three weeks ago tonight. Zeke Marlow, our maintenance engineer — the man who " +
        "wired half of this place and the Knickerbocker Array besides. He came out of the pod swearing and asked for coffee. There is no coffee.\n\n" +
        "He sits by Pod 7 every night. He says the radio up top is reading names, and one of them is his. He says they want the Array. I told him " +
        "not to answer. He says he never answers anything. That is the first thing he has lied to me about.",
    },
    {
      title: "LOG 1989 — Final Entry",
      learn: LOCK_ID,
      action: () => {
        readLogs("Director Calloway's terminal");
      },
      text: () =>
        "Zeke has gone up. I am going after him, and then I am going to find whoever is reading names on that radio and ask them, as a " +
        "federal employee, what in God's name they think they are doing.\n\nPod 7 is the last green pod. CUSTODIAN says it will open on its own " +
        "schedule. If you are the one reading this, " +
        L.heroName() +
        ": I am sorry about the coffee.\n\nThe blast door keypad takes " +
        CODE +
        " — the day we went under. The service stair comes out behind the Municipal Building. Take the sidearm from security. Do not trust the radio.\n\n" +
        "— Dr. Ruth Calloway, Facility Director, Cryo Unit C-9",
    },
  ];
  const directorTerm = {
    title: "CRYO UNIT C-9 — FACILITY DIRECTOR",
    header:
      "OFFICE OF CIVIL DEFENSE — PROJECT LONG WINTER\nCRYO UNIT C-9 / DIRECTOR R. CALLOWAY\n>> PERSONAL LOG. DO NOT REMOVE FROM PREMISES.",
    entries: [
      {
        title: "Facility Status",
        text: () =>
          "PODS INSTALLED: 40\nPODS GREEN: " +
          (Q.isComplete("mq01") || L.flag("got_goggles")
            ? "0 (POD 7 DISCHARGED)"
            : "1 (POD 7)") +
          "\nSTAFF ON DUTY: 0\nBLAST DOOR: " +
          (blastOpen() ? "OPEN" : "SEALED") +
          "\nCOFFEE: NONE",
      },
    ].concat(LOGS),
  };
  const custodianTerm = {
    title: "CUSTODIAN — FACILITY COMPUTER",
    header:
      "CUSTODIAN MAINFRAME — CRYO UNIT C-9\nCORE TEMPERATURE: HIGH. MEMORY: 61% (DEGRADING)\n>> GOOD MORNING. IT IS MORNING. PROBABLY.",
    entries: [
      {
        title: "QUERY: STATUS",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text:
          "ALL SYSTEMS NOMINAL.\n\nCORRECTION: COOLING LOOP B NOMINAL. COOLING LOOP A NOT FOUND. POWER: 14% OF RATED. PEST CONTROL: SEE MAINTENANCE " +
          "CORRIDOR. HUMAN STAFF: 0.\n\nCORRECTION: ALL SYSTEMS ACCEPTABLE.",
      },
      {
        title: "QUERY: ROLL CALL",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text: () =>
          "POD 7 ....... " +
          HERO() +
          " ....... DISCHARGED (THAW COMPLETE)\nPOD 9 ....... MARLOW, E. Z. ....... DISCHARGED (FAULT) 21 DAYS AGO\n" +
          "PODS 1-6, 8, 10-40 ....... FAILED. NAMES ON FILE. NAMES WILL BE READ ON REQUEST.\n\nDIRECTOR CALLOWAY ....... LEFT PREMISES 10 DAYS AGO. " +
          "DID NOT SIGN OUT. THIS HAS BEEN LOGGED.",
      },
      {
        title: "QUERY: THE DATE",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text:
          "CALENDAR: 1989.\n\nTHIS UNIT WAS SEALED 20 FEBRUARY 1967. ELAPSED: 22 YEARS. THE PROGRAM SPECIFIED 90 DAYS.\n\nTHIS UNIT APOLOGIZES FOR THE OVERRUN. " +
          "THIS UNIT HAS FILED A REPORT. THERE IS NO ONE TO RECEIVE THE REPORT. THE REPORT HAS BEEN FILED ANYWAY.",
      },
      {
        title: "QUERY: WHAT HAPPENED",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text:
          "MARCH 5, 1967, 09:47. ONE SEISMIC EVENT, NORTH. TELETYPE TRAFFIC CEASED 09:49.\n\nTHE EXTERNAL WORLD IS OUTSIDE THIS " +
          "UNIT'S AREA OF RESPONSIBILITY. THIS UNIT IS RESPONSIBLE FOR YOU. PLEASE TAKE A SIDEARM AND A COAT.",
      },
      {
        title: "QUERY: GOODBYE",
        cond: () => blastOpen(),
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text: "GOODBYE, POD 7.\n\nIF YOU FIND THE DIRECTOR, PLEASE TELL HER THAT THIS UNIT KEPT THE LIGHTS ON.",
      },
    ],
  };

  L.hook("register", function () {
    L.terminal("cryo_director", directorTerm);
    L.terminal("cryo_custodian", custodianTerm);
  });

  L.hook("world", function () {
    computeSpots();
    if (C.directorTerm)
      safeCall("term", () =>
        L.spawnTerminal("cryo_director", C.directorTerm, C.directorTermYaw),
      );
    if (C.custodianTerm)
      safeCall("term", () =>
        L.spawnTerminal("cryo_custodian", C.custodianTerm, C.custodianTermYaw),
      );
    // The keypad's lock belongs to the map; tell the lock audit where its code can be learned.
    if (locksLive() && G.locks.learnableFrom)
      safeCall("learnableFrom", () =>
        G.locks.learnableFrom(
          LOCK_ID,
          "Director Calloway's terminal + desk note (Cryo Unit C-9)",
        ),
      );
    // No blast door from the map (yet): a keypad stand-in so MQ01 can still be finished.
    const mapDoor = mapLive() && typeof G.map.openBlastDoor === "function";
    if (!mapDoor && C.keypad && G.world.addInteractable) {
      if (locksLive() && G.locks.register)
        safeCall("register", () =>
          G.locks.register({
            id: LOCK_ID,
            label: "C-9 Blast Door",
            code: CODE,
            kind: "door",
            hint: "Director Calloway's terminal and desk note",
          }),
        );
      G.world.addInteractable({
        pos: L.V3(C.keypad.x, (C.keypad.y || 0) + 1.3, C.keypad.z),
        radius: 0.8,
        label: "Blast Door Keypad",
        verb: "Use",
        onInteract: useFallbackKeypad,
      });
    }
    // No street door at the top of the service stair (yet): a stand-in stair that walks out to the street.
    if (
      !L.cryoExitDoor() &&
      C.exit &&
      G.LAYOUT.cryoExit &&
      G.world.addInteractable
    ) {
      G.world.addInteractable({
        pos: L.V3(C.exit.x, (C.exit.y || 0) + 1.2, C.exit.z),
        radius: 1.0,
        label: "Service Stair",
        verb: "Climb",
        onInteract() {
          if (!blastOpen()) {
            L.notify("The blast door is shut.");
            return;
          }
          const X = G.LAYOUT.cryoExit;
          L.travel(X.x, X.y || 0, X.z, X.yaw || 0);
        },
      });
    }
  });

  // ------------------------------------------------------------------
  // World objects (spawned on newGame and after loading)
  // ------------------------------------------------------------------
  let spawnGen = -1;
