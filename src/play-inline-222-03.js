// play-inline-222 03 — title
// Lines 291-474 of readable/play-inline-222.pretty.js (statement-aligned).
  function defineTerminals() {
    if (G.isStub("terminals") || !G.terminals.register) return;
    const T = (id, def) =>
      PH.safe("term " + id, () => G.terminals.register(id, def));
    T("ph_ellis_registry", {
      title: "ELLIS ISLAND IMMIGRATION MUSEUM",
      header:
        "NATIONAL PARK SERVICE — KESTREL TELETYPE\nCURATORIAL & VISITOR SERVICES",
      lock: PH.regLock({
        id: "ph_lk_ellis_term",
        label: "Ellis Island Museum Teletype",
        passcode: "THIMBLE",
        hint: "Registrar Augustine still remembers the rangers' old passcode.",
      }),
      entries: [
        {
          title: "Visitor Notice (Mar. 1967)",
          text: "Due to the current international situation, the Immigration Museum will serve as a Federal Emergency Processing Center until further notice. Tours are suspended. The Great Hall will house evacuees from the New Jersey waterfront. Please be patient with our volunteers. They are also frightened.",
        },
        {
          title: "Registry Ledger (excerpt)",
          text: '1988-05  Arrival: "Dutch", skiff-builder, Red Hook. Condition: seasick. Assigned: boathouse.\n1988-08  Arrival: family (3), Staten Island. Fed, sheltered, left for Jersey. Wished them luck. Meant it.\n1989-01  Departure: "Beppe", to Ward C. God keep him.\n1989-03  Nadia Osei failed to return with the dawn skiff. Pirate colours seen off the Navy Yard. Must find someone foolish enough to help.',
        },
        {
          title: "Ranger Vell — Personal",
          text: 'I gave the tour four times a day for two years before the bombs. "Twelve million people passed through this room." I used to say it with a straight face and a practiced catch in the throat.\n\nNow I say it to burned, hungry survivors who come up the stairs with nothing, and the catch in the throat is not practiced.',
        },
        {
          title: ">> Release Records Room lock",
          cond: () => !PH.flag("ellis_records_open"),
          action: () => {
            PH.setFlag("ellis_records_open");
            PH.sfx("door_open");
            G.notify("Records Room lock released.");
          },
        },
      ],
    });
    T("ph_ellis_bsi", {
      title: "BOARD OF SPECIAL INQUIRY",
      header:
        "U.S. IMMIGRATION SERVICE — HEARING RECORDS\nSESSION IN PROGRESS (SINCE 03.05.1967)",
      entries: [
        {
          title: "Docket — 03.05.1967",
          text: '08:30  1967-0305-41  Lindqvist (2) — ADMITTED\n08:52  1967-0305-42  Moretti (1) — ADMITTED (chalk mark "L" disputed)\n09:15  1967-0305-43  Ferreira (4) — ADMITTED\n09:38  1967-0305-44  Osei (5) — [RULING NOT ENTERED]',
        },
        {
          title: "Chair's Note",
          text: 'We are told we are "the gate". We decide who is fit to be American. Most days I think the question is backwards. The people climbing those stairs have crossed an ocean; the question is whether WE are fit to receive them.',
        },
        {
          title: "Case 1967-0305-44 — Addendum (1988)",
          text: "[Added in a different hand, years later.]\nRuling: ADMITTED. All of them. The little one, Nadia, runs the ferry now.\n— A. Vell, for the Board",
        },
      ],
    });
    T("ph_domino_ops", {
      title: "BROOKLYN SUGAR WORKS — PLANT OPERATIONS",
      header:
        'PLANT OPERATIONS TELETYPE — BOILER HOUSE\n"A BRIGHTER TOMORROW, ONE CUBE AT A TIME"',
      entries: [
        {
          title: "Boiler Status",
          text: () =>
            "BOILER 1: COLD\nBOILER 2: COLD\nBOILER 3: PRESSURE ANOMALY — relief joints venting intermittently" +
            (PH.flag("domino_vents_off")
              ? "\n\n[MANUAL BLOWDOWN COMPLETE — LINES DEPRESSURIZED]"
              : "\n\nRECOMMEND: MANUAL BLOWDOWN"),
        },
        {
          title: 'Memo: "Freedom Flakes" Contract',
          text: 'To all shifts: Hudson Valley Foods has renewed the Freedom Flakes contract for 1968. Additive line 4 ("Flake Glaze", supplied sealed, DO NOT OPEN) will run double shifts. Management reminds staff that the dust is "perfectly safe" and that any glowing in the break room is "a lighting issue."',
        },
        {
          title: "Pigeon Complaint #212",
          text: "The silo pigeons have been eating the additive spill and are now the size of cats. They are aggressive. One of them took Sal's lunch AND Sal's thermos. Requesting a man with a shotgun.",
        },
        {
          title: ">> Manual blowdown (vent steam lines)",
          cond: () => !PH.flag("domino_vents_off"),
          action: () => {
            PH.setFlag("domino_vents_off");
            PH.sfx("fire_loop");
            G.notify(
              "The boiler house shrieks, then goes quiet. The steam lines are depressurized.",
            );
            PH.xp(15, "Plant operations");
          },
        },
      ],
    });
    T("ph_domino_qc", {
      title: "QUALITY CONTROL — LAB 2",
      header:
        'FREEDOM FLAKES — QC TELETYPE\nPOLARIMETRY / ASH / COLOR / "ADDITIVE COMPLIANCE"',
      lock: PH.regLock({
        id: "ph_lk_dom_qc_term",
        label: "QC Teletype",
        passcode: "CANEFIELD",
        hint: "Foreman Russo's night-shift clipboard in the warehouse lists the QC passcode.",
      }),
      entries: [
        {
          title: "Batch 67-0222 Report",
          text: 'Polarization: 99.9° — excellent.\nAsh: 0.01% — excellent.\nAdditive compliance ("Flake Glaze"): 9.0% — per spec.\nGeiger reading of finished product: 0.4 rad/hr — "per spec" (spec amended 02/1967).',
        },
        {
          title: "Pure Cane Reserve",
          text: "Lot 1884 (\"Founder's Reserve\") — uncut, pre-additive cane sugar, sealed in 1966 for the centennial display. Stored: QC lab, north corner. Do NOT process. Do NOT let R&D near it.\n\nP.S. The QC petty-cash safe is set to the lot number, 1-8-8-4, at Mr. Russo's request. He says he cannot remember anything else.",
          learn: "ph_lk_dom_qc_safe",
        },
        {
          title: "R&D Memo (Confidential)",
          text: 'Re: longevity trials. Test subjects fed exclusively on Formula 7 for 90 days report "incredible energy" and "a humming in the teeth." We recommend the product for the military ration contract. We recommend further study. We recommend nobody at this company eat it.',
        },
      ],
    });
    T("ph_hudson_engineering", {
      title: "USS HUDSON — ENGINEERING",
      header:
        "GENERAL ATOMICS MARINE DIVISION\nATOMIC STEAM PLANT MK.II — CONTROL",
      lock: PH.regLock({
        id: "ph_lk_hud_eng",
        label: "Hudson Engineering Teletype",
        passcode: "ZEBRA",
        hint: "The captain's log reel in his cabin names the engineering passcode.",
      }),
      entries: [
        {
          title: "Plant Status",
          text: () =>
            "REACTOR: " +
            (PH.flag("hudson_scram")
              ? "SCRAMMED (SUBCRITICAL)"
              : "IDLE — COOLANT LOSS 31%, PRIMARY LEAK DETECTED") +
            "\nSHAFT POWER: 0 SHP\nDRYDOCK INTERLOCK: ENGAGED",
        },
        {
          title: "Refit Memo (1966)",
          text: "The Navy wanted a battleship in New York Harbor by spring. We had a museum and a prototype reactor that failed its sea trials. Problem solved. Tolerances have been adjusted to reflect operational realities.",
        },
        {
          title: "Pirate Graffiti (typed)",
          text: "THE GLOWY TANK MAKES YOUR HAIR FALL OUT. DO NOT NAP IN ENGINE ROOM. — MGMT (KEGS)",
        },
        {
          title: ">> SCRAM reactor (insert control rods)",
          cond: () => !PH.flag("hudson_scram"),
          action: () => {
            PH.setFlag("hudson_scram");
            PH.applyScram();
            G.notify(
              "Control rods drop with a boom you feel in your fillings. The engine room's glow fades.",
            );
            PH.xp(25, "Reactor SCRAM");
          },
        },
      ],
    });
    T("ph_hudson_radio", {
      title: "USS HUDSON — RADIO CENTRAL",
      header:
        "NAVAL COMMUNICATIONS — TELETYPE RELAY\nFLEET BROADCAST: NO CARRIER",
      entries: [
        {
          title: "Last Traffic (03.05.1967)",
          text: "0941 FROM COMNAVEAST: ALL UNITS CONDITION ZEBRA.\n0943 FROM COMNAVEAST: ALL UNITS\n0943 FROM COMNAVEAST: \n[Nothing further for 22 years.]",
        },
        {
          title: "Pirate Radio Scripts",
          text: '"This is the Commodore, broadcasting from the mighty Hudson! Ellis Islanders, your skiffs are ours, your harbor is ours, and your Registrar still owes me an apology. Pirates: rum ration is canceled. We don\'t have rum. Carry on."',
        },
        {
          title: "Intercept: Registry Skiff Schedule",
          text: 'ELLIS → BATTERY: dawn, pilot OSEI. Cargo: soup (?), medicine, "books". Escort: none. — (in grease pencil) EASY PICKINGS',
        },
      ],
    });
  }

  // =====================================================================
  // DIALOGUE
  // =====================================================================
