// play-inline-161 04 — title
// Lines 615-793 of readable/play-inline-161.pretty.js (statement-aligned).
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
