// play-inline-285 04 — title
// Lines 462-627 of readable/play-inline-285.pretty.js (statement-aligned).
  function defineTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    const T = (id, def) =>
      P.safe("term:" + id, () => G.terminals.register(id, def));
    T("pt_es_security", {
      title: "STUDIO 50 — LOBBY SECURITY",
      header: "COLUMBIA BROADCASTING — STUDIO 50\nVisitor Services Telelink",
      entries: [
        {
          title: "Visitor Log (03/05/67)",
          text: '08:02  Studio audience, TOMORROW HOUR Sunday-morning dress (recorded for tonight) — 212 ticket holders admitted\n08:30  Civil Defense sponsor representative (Mr. Albrecht) — VIP box\n09:15  CIVIL DEFENCE NOTICE RECEIVED — tonight\'s broadcast pre-empted\n09:41  Audience asked to remain seated by MR. SHOWTIME (robot MC). Audience remained seated.\n09:44  Doors locked by usher units. Reason given: "LIVE BROADCAST IN PROGRESS."',
        },
        {
          title: "Robot Staff Roster",
          text: 'MS-1 "MR. SHOWTIME" — American Automaton Co. entertainment unit (Valet chassis, Civil Defense personality package "MASTER OF CEREMONIES")\nPU-1 to PU-4 — American Automaton Patrolman ushers ("Please remain seated")\nNOTE: Do not let MS-1 near the vision mixer. He believes he is the director.',
        },
        {
          title: "Maintenance Ticket #5021",
          text: 'Usher units will not accept "the show is over" as a valid command. Suggest a software patch. Or a sledgehammer.\n— E. Rojas, Facilities',
        },
      ],
    });
    T("pt_es_producer", {
      title: "OFFICE OF THE PRODUCER",
      header:
        "THE TOMORROW HOUR — Harold Fairbanks, Producer\nPersonal Telelink",
      lock: P.LOCKS.es_producer,
      entries: [
        {
          title: "Memo: Sponsor Notes",
          text: 'From: Civil Defense Public Relations\nRe: Sunday\'s script\n\nPlease cut the sketch where Jack pretends the shelter hatch is stuck. Test audiences found it "less funny than intended" and "specifically upsetting". Replace with additional footage of the model family-shelter swimming pool. Family shelters do not have swimming pools. Please do not mention this.',
        },
        {
          title: "Memo: Mr. Showtime",
          text: 'Harold — the robot improvised again. Eleven minutes on "why the audience must never leave". The network loved it. I did not love it. The audience did not leave. — Sid',
        },
        {
          title: "Master Reel",
          learn: "pt_es_safe",
          text: "Tonight's master is in my office safe (5-0-5-0, Studio 50 twice). If the network wants it they can come and get it themselves. Remote release below.",
        },
        {
          title: "Release office safe lock",
          text: "> SAFE SOLENOID RELEASED.\nThe safe in the corner clunks.",
          action: () => {
            F.safeReleased = true;
            P.safe("unlock", () => {
              if (P.locksLive()) G.locks.unlock(P.LOCKS.es_safe.id);
            });
            releaseSafe();
          },
        },
      ],
    });
    T("pt_es_transmitter", {
      title: "STUDIO 50 TRANSMITTER",
      header:
        "RCA TT-50 TRANSMITTER — Engineering Console\nWARNING: HIGH VOLTAGE",
      entries: [
        {
          title: "Transmitter Status",
          text: () =>
            F.power
              ? "MAIN POWER: ON\nPLATE VOLTAGE: NOMINAL-ISH\nCARRIER: READY\nThe valves glow a deep, hopeful blue."
              : "MAIN POWER: OFF (manual shutdown 03/05/67 09:30 — S. Mancuso)\nEMERGENCY BUS: 11%\nSTANDBY LIGHTING ONLY.",
        },
        {
          title: "Engage Main Power",
          cond: () => !F.power,
          text: "> ENGAGING MAIN POWER...\n> PLATE VOLTAGE RISING\n> The building shudders. Somewhere above, a studio monitor blinks on.",
          action: () => C.restorePower(),
        },
        {
          title: "Engineer's Note",
          text: "If you're reading this, the robots are still upstairs and still on shift. Mr. Showtime draws his audience-counting routine from the house lights. Kill the lights and he'll stand on the stage forever, waiting for a show. — E. Rojas",
        },
      ],
    });
    T("pt_es_control", {
      title: "STUDIO 50 CONTROL ROOM",
      header:
        "THE TOMORROW HOUR — Master Control\nTape Machine 2 · Vision Mixer · Transmitter Link",
      entries: [
        {
          title: "Program Log",
          text: 'SUN 03/05/67 — THE TOMORROW HOUR (DRESS, RECORDED FOR 8 P.M. AIR)\n08:30 Cold open (Jack)\n08:34 Civil Defense Singers — "Shelter Sweet Shelter"\n08:41 Sketch: "The Stuck Door" (CUT per sponsor)\n08:49 Mr. Showtime — audience participation\n09:01 A Message About Your Family\'s Future\n09:28 Good night',
        },
        {
          title: "Broadcast Status",
          text: () =>
            F.broadcast
              ? "ON AIR.\nTHE TOMORROW HOUR — 03/05/67 master — looping on all channels the old mast can reach."
              : !F.power
                ? "TRANSMITTER LINK: NO POWER\n(see engineering console, basement)"
                : "TRANSMITTER LINK: READY\nTAPE MACHINE 2: EMPTY",
        },
        {
          title: "Load Master Reel & Go To Air",
          cond: () => !F.broadcast && F.power && has("pt_es_master_reel"),
          text: "> THREADING REEL ON MACHINE 2... OK\n> ROLLING\n> VISION MIXER: CAMERA 1\n> TRANSMITTER: CARRIER UP\n\nThe ON AIR signs flicker, then burn red. Somewhere in the dark auditorium a recorded audience begins to applaud.",
          action: () => C.goToAir(),
        },
        {
          title: "Load Master Reel & Go To Air",
          cond: () => !F.broadcast && (!F.power || !has("pt_es_master_reel")),
          text: () =>
            !F.power
              ? "> ERROR: TRANSMITTER LINK HAS NO POWER."
              : "> ERROR: NO REEL ON MACHINE 2.",
        },
        {
          title: "Monitor: Final Show (playback)",
          cond: () => F.broadcast,
          text: 'On the flickering monitor a man with a very white smile and a very blue tuxedo taps the microphone. "Good evening, America! ...Folks, they tell me we\'re being pre-empted tonight. Pre-empted! By what? By the future!" Laughter. "And you know what they say about the future: it\'s coming whether you\'ve got a shelter or not!" The laughter falters. The man keeps smiling. He smiles for the whole hour.',
        },
      ],
    });
    T("pt_ly_director", {
      title: "LYCEUM — DIRECTOR'S OFFICE",
      header: "THE LYCEUM PLAYERS\n(est. 1967, rather unexpectedly)",
      entries: [
        {
          title: "Company Roster",
          text: "BARNABY THISTLEWOOD — Artistic Director, Stage Manager (the part AND the job)\nGENEVIEVE LAURENT — Emily Webb (since 1967; has not aged a day. Has aged every other way.)\nTESS CARRAWAY — Stage Manager (the job), props, provisions, the only one of us with a pulse\nROSALIND — Makeup, wigs, wounds\nMORTIMER — Front of house, bar, bouncer\nTICKET-TAKER — Usher (salvaged; unpaid; happier than any of us)",
        },
        {
          title: "Rehearsal Notes",
          text: 'Act I: FASTER. We have been doing this play for twenty-two years and it has gotten longer every decade.\nAct II: The wedding. Mortimer, the "Maniac guests" are a JOKE, stop howling at the audience.\nAct III: Lights. We need a real spot for Emily\'s last speech. The old Kliegs at Studio 50 across town — CBS kept a dozen. If only someone could get past those wretched robots.\nALSO: WHO TOOK THE PROMPT BOOK. (Tess says raiders. Tess says it with a straight face.)',
        },
        {
          title: "Accounts",
          text: "Tickets sold this season: 31\nScrip: 155\nScrip owed by Mortimer to the bar: 155\nNet: art",
        },
      ],
    });
    T("pt_pa_dispatch", {
      title: "DISPATCHER — UPPER LEVEL",
      header:
        "PORT AUTHORITY BUS TERMINAL\nUpper Level Dispatch · Gates 201-206",
      lock: P.LOCKS.pa_dispatch,
      entries: [
        {
          title: "Cash Safe",
          learn: "pt_pa_safe",
          text: "Dispatcher's cash safe: 4-1-0-5. Night drawer only. — Mgmt",
        },
        {
          title: "Dispatch Log (03/05/67)",
          text: "07:55 All westbound gates at capacity\n08:40 G206 Pittsburgh — 11 over manifest, departed 09:21\n09:30 Lincoln Tunnel closed by order of NYPD\n09:40 G203 cancelled (driver did not report)\n09:44 All gates hold.\n09:47 —",
        },
        {
          title: "THE TOLL LEDGER (raider)",
          text: "WHO PAYD\n- trade wagon guy: 40 scrip + 1 pack oxen (ate it)\n- old guy w/ hat: 5 scrip + hat\n- kid: 0 scrip (let him go, dont tell nobody)\n- that DRAMA lady from 45th: 1 BIG BOOK (worth nothing?? keep it anyway, BOSS likes the pictures)",
        },
        {
          title: "Gate Status",
          text: "G201 BOSTON — HOLD\nG202 PHILADELPHIA — HOLD\nG203 ATLANTIC CITY — CANCELLED\nG204 ALBANY — HOLD\nG205 THE COMMONWEALTH — HOLD\nG206 PITTSBURGH — HOLD\n\nHOLD HOLD HOLD HOLD HOLD HOLD",
        },
      ],
    });
  }

  // ==================================================================
  // DIALOGUE
  // ==================================================================
