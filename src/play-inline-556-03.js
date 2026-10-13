// play-inline-556 03 — assign
// Lines 605-676 of readable/play-inline-556.pretty.js (statement-aligned).
  const SLEEP_BARKS = {
    idle: [
      "Zzz…",
      "*wheezy snore*",
      "…turn the neon down…",
      "…five more years…",
      "Mmh… scrip… so much scrip…",
    ],
    greet: [
      "Hrrn? Come back after dark, kid.",
      "Daytime's for topsiders. Let a body sleep.",
      "Unless the square's on fire, go away.",
    ],
  };
  const HAWK = {
    neon_newsie: [
      "Extra! Extra! Brute king still up the Empire State! Read all about it!",
      "Neon Gazette, one scrip! Now with forty percent fewer typos!",
      "EXTRA! Local man finds both eyebrows! Owner still missing!",
      "Get your Gazette! Horoscopes, obituaries, and the obituaries of horoscopes!",
    ],
    neon_doomer: [
      "The end is NIGH! …Again! It keeps being nigh!",
      "Repent! The bombs were only the OPENING ACT!",
      "It's not the end of the world, friends. That was twenty-two years ago. This is the ENCORE.",
      "The sky is falling! Slowly! One rad at a time!",
    ],
    neon_tout: [
      "Tickets! Tickets for tonight's Revue! Best seats in the house — the house has three!",
      "Velvet Maloney, live at the Opry! Still alive, technically!",
      "Two scrip a seat! Standing room's free, but you gotta stand next to Gums!",
      "Tonight only! And every other night!",
    ],
  };
  const EAT_BARKS = [
    "One bowl. Extra broth. Hold the… whatever that is.",
    "Mm. Tastes like 1967.",
    "Is this pigeon? Don't tell me. I don't want to know. Tell me.",
    "Put it on my tab. What do you mean I don't have a tab?",
    "Hot! Hot hot hot! …Twenty-two years and I still never blow on it.",
    "Same as yesterday. Same as the last twenty years.",
  ];
  const SINGING = [
    "♪ Oh the lights on Broadway never go out… ♪",
    "♪ …and my heart burns ember-red for you, darling, red for you… ♪",
    "♪ Twenty-two years, and I'm still waiting on my cue… ♪",
    "♪ Don't mind my face, just mind the song… ♪",
    "♪ Neon, neon, burnin' through the night… ♪",
    "♪ …shine on, shine on, you radioactive moon… ♪",
  ];

  // ------------------------------------------------------------------
  // Roster
  // ------------------------------------------------------------------
  const gh = (o) => Object.assign({ type: "human", faction: "settlers" }, o);
  const GATES = [
    ["n", "guard1", 0, 4],
    ["s", "guard2", 0, -4],
    ["e", "guard4", -4, 0],
    ["w", "guard3", 4, 0],
  ];
  const GUARD_W = [
    "assault_rifle",
    "hunting_rifle",
    "combat_shotgun",
    "smg_10mm",
    "assault_rifle",
    "hunting_rifle",
    "combat_shotgun",
    "mat49_smg",
  ];

