// play-inline-564 07 — push
// Lines 1986-2236 of readable/play-inline-564.pretty.js (statement-aligned).
  function worldSlides() {
    const t = L.flag("ms_torch") || "charter";
    const choice = {
      reclamation: "purify",
      selective: "selective",
      charter: "covenant",
      destroyed: "destroy",
    }[t];
    const f = (k) => L.flag(k);
    const g = (k) => L.flag("glow_" + k);
    const N = hero();
    const S = [];
    const push = (title, text, art) =>
      S.push({ title, text, art: art || null });
    // Cryo Unit C-9
    if (choice === "purify")
      push(
        "CRYO UNIT C-9",
        'Under the Municipal Building, CUSTODIAN logged the new sky as "ATMOSPHERIC CONDITION: NOMINAL (FIRST OCCURRENCE)" and printed the line eleven hundred times before its last ribbon ran dry. Zeke had the printout framed. It hangs crooked over the Oyster Bar, and Moe refuses to straighten it.',
        "cryo",
      );
    else if (choice === "selective")
      push(
        "CRYO UNIT C-9",
        "Cryo Unit C-9 was resealed by order of the Continuity, and CUSTODIAN was reassigned to keep the new census. It printed the names of the enrolled for a year. After that, it printed no new names at all.",
        "cryo",
      );
    else
      push(
        "CRYO UNIT C-9",
        "Cryo Unit C-9 stayed where it was: thirty-eight failed pods and two empty ones under the Municipal Building. CUSTODIAN typed out a full report on the spring of 1989, addressed it to the Office of Civil Defense, and waited for a reply. It is very good at waiting.",
        "cryo",
      );
    // The Neon
    if (choice === "selective")
      push(
        "THE NEON",
        "Times Square went dark and stayed dark. Mayor Crowe, Big Sal, Marigold and every unenrolled soul in the Neon were the first to fall to the census. The signs still hang there — FIZZO COLA, PRAIRIE ROOT BEER, HI-OCTANE HARRY'S — advertising to no one.",
        "neon_dark",
      );
    else if (
      f("ms_sun_battery") === "neon" ||
      f("neon_outcome") === "crowe" ||
      f("neon_outcome") === "repair"
    )
      push(
        "THE NEON",
        "Thanks to a rig battery and a stubborn sleeper, the lights of the Neon never went out. Mayor Crowe declared " +
          N +
          " an Honorary Citizen in perpetuity, and every year on the anniversary the people of Times Square switch every sign on at once, just to hear the newcomers gasp.",
        "neon",
      );
    else
      push(
        "THE NEON",
        "The Big Buzz sputtered on for another year before the folks of the Neon pooled their scrip and bought a new battery off a Brooklyn convoy. Mayor Crowe gave a four-hour speech about it. Nobody stayed for the end.",
        "neon",
      );
    // Wendell & Marjorie
    if (f("wendell_wed") && choice !== "selective")
      push(
        "WENDELL & MARJORIE",
        'Wendell Pruitt and Marjorie "Marigold" Dunn were married in Housewares on the third floor of Sterling\'s — cleared of Maniacs for the occasion by a very reluctant Covenant patrol. It was, by general agreement, the longest engagement in the history of New York.',
        "wedding",
      );
    // Grand Central
    let gc = g("isotope_planted")
      ? "Grand Central Market never fully recovered from the poisoning of its water tower. Doc Hollis worked himself half to death that spring."
      : "Grand Central Market grew into the beating heart of Manhattan. Stationmaster Okafor ran it for thirty more years and never once fixed the clock.";
    if (!g("isotope_planted")) {
      if (f("pete_rescued"))
        gc +=
          " Pete Ruiz drove the Broadway run until he was eighty, and never again ate anything he could not identify.";
      if (f("dolores_recruited"))
        gc +=
          " Deadeye Dolores watched over its convoys from a window on 42nd Street for the rest of her life.";
      if (f("bridge_legit"))
        gc +=
          " The Brooklyn Bridge Toll Authority — under Commissioner Tony — became the most reliable institution in the five boroughs, issuing over a million receipts.";
      else if (f("bridge_resolved"))
        gc +=
          " With the Brooklyn Bridge open again, Brooklyn's traders poured across the river.";
      if (f("wagon_honest"))
        gc +=
          " Caldwell & Daughter grew into the largest convoy company on the Eastern Seaboard.";
    }
    push("GRAND CENTRAL MARKET", gc, "market");
    // KONG
    if (f("kong_friend") && choice !== "selective")
      push(
        "KONG",
        "Kong, King of the Empire, and Fay, his silent queen, reigned over the Empire State Building for decades. Sightseers — yes, sightseers — came to see the couple on the observation deck. Nobody screamed. Kong was very happy.",
        "kong",
      );
    else if (f("kong_dead"))
      push(
        "KONG",
        "Kong, King of the Empire, died as he had lived: enormous, confused and very loud. Within a year the tower belonged to the pigeons.",
        "kong",
      );
    // The Covenant / the Continuity
    if (
      choice === "covenant" ||
      (faction() === "covenant" && choice !== "selective" && !f("stroud_dead"))
    )
      push(
        "THE IRON COVENANT",
        "Rockefeller Hold kept Manhattan for a generation. Lancer-Commander Stroud ruled with an iron hand and a closed fist; the city was safer, and quieter, and not entirely free.",
        "covenant",
      );
    if (f("crane_betrayed") && !f("crane_dead"))
      push(
        "COLONEL CRANE",
        "Colonel Augustus Crane was last seen climbing into a Rotorcraft on Liberty Island, still shouting. Continuity Radio spent a year calling " +
          N +
          " a traitor to the Republic, in triplicate.",
        "crane",
      );
    if (choice === "selective")
      push(
        "THE CONTINUITY",
        'With the census "restored," the Continuity declared Manhattan the provisional capital and the year, officially, 1967.' +
          (f("crane_dead") ? "" : " Colonel Crane was promoted.") +
          " Within a generation there was nobody young enough left to salute anybody.",
        "continuity",
      );
    else if ((f("hale_defects") || f("hale_knows")) && !f("hale_dead"))
      push(
        "LIEUTENANT HALE",
        "Vesper Hale never went back to the Continuity. She settled in Grand Central, where she taught the market's children to read — starting with the fine print.",
        "hale",
      );
    else
      push(
        "THE CONTINUITY",
        "The Continuity's eastern command never recovered from the loss of Liberty Island. Their Sky-Eye drones still drift over the Ruins at night, playing the anthem to a country that stopped listening a long time ago.",
        "continuity",
      );
    // Biscuit
    if (f("biscuit_dead"))
      push(
        "BISCUIT",
        "Biscuit, the dog from Bethesda Terrace, fell defending the one he'd chosen. Somebody keeps a bowl of water by his cairn. Somebody keeps it clean.",
        "dog",
      );
    else if (f("biscuit_recruited"))
      push(
        "BISCUIT",
        "Biscuit never left " +
          N +
          '\'s side. He never learned "heel," either. He grew grey around the muzzle and lazy in the sun, and every burrow rat in Central Park lived in terror of him.',
        "dog",
      );
    // Companions (36_companions.js)
    if (typeof L.companionSlides === "function") {
      let cs = [];
      try {
        cs = L.companionSlides(choice, N) || [];
      } catch (e) {
        G.reportError("quests:companionSlides", e);
      }
      for (const c of cs) push(c.title, c.text, c.art || null);
    }
    return S;
  }
  // No 'main' ending any more (the finale owns endings); keep a harmless default.
  L.ending("default", function () {
    return [
      {
        title: G.GAME_NAME || "NEW RAD CITY",
        text: "The sirens stopped in 1967. The city never did.",
        art: "city",
      },
    ];
  });

  // ------------------------------------------------------------------
  // Terminal: TORCH CONTROL
  // ------------------------------------------------------------------
  const TORCH_TERMINAL = {
    title: "KNICKERBOCKER ATMOSPHERIC RECLAMATION ARRAY",
    header:
      'OFFICE OF CIVIL DEFENSE / ATLAS POWER & LIGHT — "THE TORCH"\nCIVILIAN AUTHORIZATION: CARTRIDGE C9-A REQUIRED\nTIDAL CHARGE: 6 DAYS. SCHEDULED FIRING: SUNDAY 12:00',
    entries: [
      {
        title: "System Status",
        text: () =>
          "CARTRIDGE C9-A ........... " +
          (hasKey()
            ? "PRESENT (Long Winter volunteer verified)"
            : "NOT PRESENT") +
          "\nIGNITION CORE ........... " +
          (hasCore()
            ? "PRESENT (charge 98%)"
            : L.flag("ms_torch")
              ? "LOADED"
              : "NOT PRESENT") +
          "\nPROGRAM .................. " +
          (L.flag("ms_torch")
            ? String(L.flag("ms_torch")).toUpperCase() +
              (L.flag("ms_torch") === "destroyed"
                ? ""
                : " — FIRES SUNDAY 12:00")
            : "NONE") +
          (craneResolved()
            ? ""
            : "\n\n>> MILITARY LOCKOUT ACTIVE (Col. A. Crane). Resolve command authority to proceed."),
      },
      {
        title: "Operating Modes",
        text: "RECLAMATION: scrubs airborne radioactive ash from a 40 km radius. Permanent. Indiscriminate. Beneficiaries: all living things.\n\nSELECTIVE: reclamation field keyed to the 1967 enrolment rolls (requires the executive payload, Directive 7-A, AND the enrolment microfilm). Unenrolled persons receive a sterilising dose. Recorded census refusers receive a lethal one, as do persons carrying a heavy radiation burden.\n\nOVERRIDE: transfer the Array to a recognised armed authority (requires a charter reel).\n\nOVERLOAD: emergency core purge. Destroys the Array immediately.\n\nAll programs except OVERLOAD fire on the tidal schedule: SUNDAY, 12:00.",
      },
      {
        title: "Dedication Plaque (1967)",
        text: 'THE KNICKERBOCKER ARRAY\nDedicated by the Office of Civil Defense and Atlas Power & Light, February 1967, "so that whatever comes, New York shall always breathe free."\n\n[Scratched beneath, much later: "we built it for everybody — Z."]',
      },
      {
        title: ">> LOAD RECLAMATION (FIRES SUNDAY NOON)",
        cond: () => canChoose(),
        action: () => choose("purify"),
      },
      {
        title: ">> LOAD DIRECTIVE 7-A: SELECTIVE (FIRES SUNDAY NOON)",
        cond: () =>
          canChoose() && L.has("q_reel_directive_7a") && microfilmHere(),
        action: () => choose("selective"),
      },
      {
        title: ">> APPLY CHARTER OVERRIDE: THE IRON COVENANT",
        cond: () => canChoose() && L.has("q_reel_codex_override"),
        action: () => choose("covenant"),
      },
      {
        title: ">> INITIATE CORE OVERLOAD (DESTROY ARRAY NOW)",
        cond: () => canChoose(),
        action: () => choose("destroy"),
      },
      {
        title: "Liberty Station — Command Log",
        text: 'LIBERTY STATION (CONTINUITY OF GOVERNMENT) — COL. A. CRANE COMMANDING\n\nDay 2: Asset MARLOW (Long Winter, C-9) continues to refuse. Asset MARLOW has repaired the station\'s water heater "out of spite."\nDay 6: Acting President Marsh confirms Directive 7-A by radio. Countersigned. Countersigned. Countersigned.\nDay 8: The second sleeper has left C-9. They always come to us.',
      },
    ],
  };
  L.hook("register", function () {
    L.terminal("liberty_torch", TORCH_TERMINAL);
    L.terminal("liberty_command", TORCH_TERMINAL);
  });

  // ------------------------------------------------------------------
  // Dialogue: Colonel Crane, Zeke
  // ------------------------------------------------------------------
