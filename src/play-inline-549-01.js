// play-inline-549 01 — title
// Lines 12-275 of readable/play-inline-549.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;

  const NOTES = [
    // ------------------------------------------------------------ Cryo Unit C-9
    {
      id: "q_reel_zeke",
      type: "note",
      reel: true,
      name: 'Tape Reel: "For {FIRST}"',
      title: "Z. Marlow — reel left in locker 9",
      text:
        "[A reel-to-reel hiss. Someone taps the microphone twice, the way Zeke always did.]\n\nZEKE: {FIRST}. If you're hearing this, your pod held " +
        "and mine didn't — or mine did, sort of. It spat me out three weeks ago, early, like a bad slice of toast. I've been sitting with you " +
        "every night since, watching the frost on your glass. The panel says yours wakes on its own. I believe it. I don't believe much else " +
        "down here.\n\nHere's what I know. It's 1989. The bombs came in March of '67, and they didn't come from where we were told to " +
        "look. The other pods failed one by one. Dr. Calloway says sit tight. Dr. Calloway has been saying sit tight since 1968. CUSTODIAN still " +
        "talks, but it talks like a man counting his own teeth.\n\nThere's a radio up top. Voices calling themselves the government, reading " +
        "out names. One of the names was mine. They want the Knickerbocker Array — the thing on Liberty Island I helped wire in '66 — and " +
        "they want the key that starts it. That's the key in this locker. Don't give it to anybody who says please too nicely.\n\n" +
        "I'm going to Grand Central. People trade there, people talk there. Ask for me at the Oyster Bar.\n\n" +
        "I went up top twice already, at night, just to the corner. I asked after Nicky. Nobody knows the name. I'll keep asking.\n\nAnd {FIRST} — the sky is going " +
        "to look wrong. Give it a minute. It grows on you.\n\n[Click.]",
    },
    {
      id: "q_liberty_key",
      type: "note",
      quest: true,
      name: "Liberty Key (Knickerbocker Authorization)",
      weight: 0,
      value: 0,
      title:
        "OFFICE OF CIVIL DEFENSE / ATLAS POWER & LIGHT — PROJECT KNICKERBOCKER",
      text:
        "AUTHORIZATION CARTRIDGE C9-A\nCLASSIFICATION: EYES ONLY — FACILITY DIRECTOR\n\nThis cartridge carries the civilian authorization " +
        'handshake for the KNICKERBOCKER ATMOSPHERIC RECLAMATION ARRAY ("the Torch").\n\nThe Array may be operated only with (1) this cartridge ' +
        "and (2) a charged Knickerbocker Ignition Core.\n\nWARNING: Do not operate the Array in SELECTIVE mode without written consent of the " +
        "President of the United States. Do not operate the Array in RECLAMATION mode without written consent from anybody at all.\n\n" +
        "[Masking tape on the cartridge, in Zeke's block capitals: \"DON'T LOSE THIS — Z.\"]",
    },
    {
      id: "q_note_director_memo",
      type: "note",
      name: "Note on the Director's Desk",
      title: "Dr. R. Calloway — Facility Director, C-9",
      learn: "q_cryo_blast_door",
      text:
        "To whoever wakes up and reads this,\n\nI am sorry. That is the first thing, and it should have been the first thing on every " +
        "report I sent to Washington, back when Washington was reading them.\n\nThe trial was for ninety days. You have been asleep for a great " +
        "deal longer than that. If you are standing, your pod was the good one.\n\nThe blast door keypad takes 0220 — the day we went under, the twentieth of February. " +
        "The service stair beyond it comes up behind the Municipal Building's south stair. Take the security locker's sidearm. Take water. " +
        "Do not trust the radio.\n\n— R.C.",
    },

    // ------------------------------------------------------------ Central Park / Biscuit
    {
      id: "q_note_biscuit_owner",
      type: "note",
      name: "Water-Stained Letter",
      title: "To whoever finds my dog",
      text:
        "If you're reading this I'm probably the skeleton you're standing on. Sorry about that.\n\nThe dog's name is Biscuit. He's " +
        "a good boy. He is not a good guard dog; he thinks raiders are friends he hasn't met yet. He likes Golden Plain Jerky, belly rubs and biting " +
        "burrow rats in half.\n\nHe won't leave me. I've tried telling him. If you've got food and a little patience, maybe he'll leave with " +
        'you. Tell him "Biscuit, heel." He knows "heel." He ignores it, but he knows it.\n\n— Mack',
    },

    // ------------------------------------------------------------ Grand Central
    {
      id: "q_reel_zeke_travel",
      type: "note",
      reel: true,
      name: "Tape Reel: Zeke's Travel Log",
      title: "Z. Marlow — Travel Log",
      text:
        '[Wind. Distant gunfire. Zeke is out of breath.]\n\nZEKE: Day two up top. Ate a thing Moe called "tunnel shrimp." ' +
        "Didn't ask. Mistake either way.\n\nThe radio fella at Radio City — Delgado, calls himself Rocky — he's been catching the same pings I " +
        "caught on the C-9 set. Government cipher, bouncing off the Statue. He thinks with a working amplifier he can listen in proper.\n\n" +
        "If I don't come back here, {FIRST}, go see Rocky Delgado. And bring him a present. Radio men love presents.\n\n[Pause.]\n\n" +
        "ZEKE: There's a twin-rotor bird circling the Chrysler. Painted government grey. I'm going to go now.\n\n[Click.]",
    },
    {
      id: "q_note_market_rules",
      type: "note",
      name: "Grand Central Market Rules",
      title: "POSTED BY ORDER OF THE STATIONMASTER",
      text:
        "1. No shooting in the concourse. Shooting OUTSIDE the concourse is between you and God.\n2. Scrip only. No IOUs, no teeth, no " +
        '"I\'ll owe you."\n3. All folks welcome. Brutes not welcome. Folks shaped like Brutes: case by case.\n4. Do not feed the ' +
        "Info-Bot. It cannot eat and it gets upset.\n5. The clock is broken. Asking what time it is will not fix it.\n\n— D. Okafor, Stationmaster",
    },
    {
      id: "q_note_wagon_manifest",
      type: "note",
      name: "Caldwell Wagon Manifest",
      title: "CALDWELL & DAUGHTERS — MANIFEST #212",
      text:
        'Route: Flatiron → Madison Sq → Grand Central\nPack-bot: "Dolly" (Patrolman, legs welded, pulled by Ruiz)\nCargo:\n- 40 purified ' +
        "water\n- 12 med-jets (sealed)\n- 1 strongbox (DO NOT OPEN, DO NOT LET RUIZ OPEN)\n\nNotes: Ruiz says he heard whistling from the " +
        "Woolworth. I told him it's the wind. It is not the wind.",
    },
    {
      id: "q_note_raider_woolworth",
      type: "note",
      name: "Raider Scrawl",
      title: "on the back of a menu",
      text:
        "GOT THE WAGON BOX. CANT OPEN IT. HIT IT WITH A HAMMER. HIT IT WITH SKITZ. SKITZ IS A HAMMER NOW.\n\nWHOEVER WANTS IT BACK " +
        "CAN COME TO TOP OF THE WOOLWORTH AND ASK NICE AND WE WILL SAY NO.",
    },

    // ------------------------------------------------------------ Radio City
    {
      id: "q_reel_intercept",
      type: "note",
      reel: true,
      name: "Tape Reel: Intercepted Transmission",
      title: "Radio Free Manhattan — Recorded Intercept",
      text:
        "[Rocky Delgado, whispering: \"We're rolling, we're rolling.\"]\n\n[Heavy static resolves into a clipped, calm " +
        "voice reading from a form.]\n\nVOICE: —Liberty Station to Continuity Relay Albany. Asset MARLOW remains uncooperative. He insists the " +
        "Knickerbocker Array will not accept a Selective payload without the civilian cartridge. Search of Cryo Unit C-9 surface egress negative. " +
        "Recommend we let the sleeper come to us. They always come to us.\n\n[A second voice, older, further from the mic.]\n\nZEKE: If " +
        "you're hearing this — don't you dare come to—\n\n[Sound of a door. Static.]\n\nVOICE: Liberty Station out. God save the Republic, " +
        "and the date is March the sixth, 1967.\n\n[Click.]",
    },

    // ------------------------------------------------------------ Factions
    {
      id: "q_reel_codex_override",
      type: "note",
      reel: true,
      name: "Tape Reel: Charter Override",
      title: "THE IRON COVENANT — CHARTER OVERRIDE 7",
      text:
        "By authority of the Charter, and of Lancer-Commander H. Stroud, Rockefeller Chapter:\n\nThis reel transfers command authority " +
        "of any old-world installation it is played into to the Iron Covenant, for the purposes of containment, study, and protection of the " +
        "city from itself.\n\nThe Covenant thanks you for your cooperation. Your cooperation was not optional.",
    },
    {
      id: "q_reel_directive_7a",
      type: "note",
      reel: true,
      name: "Tape Reel: Directive 7-A",
      title: "THE CONTINUITY — EXECUTIVE DIRECTIVE 7-A",
      text:
        "CLASSIFIED — OFFICE OF THE ACTING PRESIDENT\n\nUpon acquisition of the Knickerbocker Array, the Array is to be operated in SELECTIVE mode.\n\n" +
        "The Selective payload re-tunes the Array's reclamation field against every person NOT entered on the 1967 Census rolls. Persons on " +
        "the rolls are unaffected. All others within the field (approx. 40 km radius) will be rendered sterile.\n\nThe Bureau of Vital Statistics " +
        'estimates a 91% reduction in the "unlisted" population of the Manhattan region within one generation. Public messaging will refer to ' +
        'this as "restoring the census."\n\nGod bless the Continuity. God bless America. Keep this reel away from Lieutenant Hale; she still ' +
        "believes the messaging.",
    },
    {
      id: "q_note_continuity_orders",
      type: "note",
      name: "Continuity Field Orders",
      title: "UN PLAZA — STANDING ORDERS",
      text:
        "1. The sleeper from C-9 is NOT to be engaged. Repeat: NOT to be engaged. We want him smiling.\n2. Sky-Eye drone SE-44 is to stop " +
        "playing the anthem at 0300. Whoever re-wired it: we know.\n3. The UN building is property of the United States Government. " +
        "It always was. Please remove the flags of other nations; they are historically inaccurate.\n\n— Lt. V. Hale, by order of Col. A. Crane",
    },
    {
      id: "q_note_kong_manifesto",
      type: "note",
      name: "KONG BOOK",
      title: "KONG BOOK (written in crayon, very large)",
      text:
        "KONG IS KING OF THE EMPIRE.\nEMPIRE IS TALLEST.\nTHEREFORE KONG IS TALLEST KING.\n\nKONG FOUND SHINY ROCK IN SMALL ROOM AT TOP. " +
        "SHINY ROCK HUMS. HUMMING MEANS IT LIKES KONG.\n\nKONG NEEDS QUEEN. QUEEN MUST BE SMALL AND PRETTY AND NOT SCREAM. ALL SMALL PRETTY " +
        "THINGS SCREAM. KONG IS SAD ABOUT THIS.\n\nKONG ALSO NEEDS BIGGER CLUB.",
    },

    // ------------------------------------------------------------ The Neon / the Glowkeepers
    {
      id: "q_note_glowkeeper_sermon",
      type: "note",
      name: "Sermon of the Second Sun",
      title: "Keeper Hollowell's Sermon Notes",
      text:
        "Brothers and sisters: for a thousand years we prayed to one sun, and it rose, and it set, and it never once answered.\n\n" +
        "Then, on a grey March morning, a second sun rose over Yonkers, and it answered everybody at once.\n\nWe do not fear the Glow. " +
        "The Glow is communion. The people of the Neon stood under the second sun like the rest of us, and yet they hang electric bulbs, as if its own " +
        "light were not enough! Pray for them. Then, perhaps, unplug them.",
    },
    {
      id: "q_note_wendell_letter",
      type: "note",
      name: "Wendell's Unsent Letter",
      title: "Dearest Marjorie",
      text:
        'Dearest Marjorie,\n\nThe big sale opens tomorrow. Management says doors open at 4 a.m. and we are to "stand aside and let the ' +
        "customers be customers.\" I will be on the third floor, Housewares. I have hidden your ring in the manager's safe so the " +
        "customers can't be customers at it.\n\nWhen the sale is over I'll ask you properly. On one knee. In Housewares, if that's all right.\n\n" +
        "All my love,\nWendell\n\n[Dated: March 5, 1967.]",
    },

    // ------------------------------------------------------------ Downtown
    {
      id: "q_note_toll_rates",
      type: "note",
      name: "Brooklyn Bridge Toll Schedule",
      title: "BROOKLYN BRIDGE TOLL AUTHORITY (UNDER NEW MANAGEMENT)",
      text:
        "CROSSING TOLLS (EACH WAY):\nPedestrian ........ 20 scrip\nPedestrian w/ dog .. 25 scrip (dog is extra)\nTrade wagon ....... 150 scrip\n" +
        "Pack ox ........... it is a cow, 200 scrip\nBrute ............. please just go\nComplaints ........ 50 scrip\n\nToken booth closed since 1967.",
    },
    {
      id: "q_note_betty_ledger",
      type: "note",
      name: "The Exchange — Ledger",
      title: "BEAR MARKET BETTY — BOOKS",
      text:
        'ASSETS: 3 floors of the Exchange, 11 raiders (9 reliable, 2 "Kevin"), 1 bell, 4,210 scrip.\nLIABILITIES: Kevin.\n\n' +
        "MARKET OUTLOOK: Bearish on trade wagons (fewer every week). Bullish on protection rackets. Neutral on the Iron Covenant (they have " +
        "armour, we have the bell).\n\nNOTE TO SELF: Ring the Closing Bell every night at sundown. Morale. Tradition. Also it scares the shellbacks.",
    },
    {
      id: "q_note_dolores_diary",
      type: "note",
      name: "Dolores' Diary",
      title: "D.D. — Up Top",
      text:
        "Day 90 in the eagle's nest. The raiders downstairs think I work for them. I work for the view.\n\nCan see all of 42nd from up " +
        "here. Wagons come, wagons go. I hit the pack-bots, never the drivers. Mostly never the drivers.\n\nSaw a fella in a padded grey-white " +
        "suit with an orange collar today, walking right down the middle of Park Avenue like he owned it. Didn't shoot. Don't know why. " +
        "Maybe I'm getting soft. Maybe I'm getting tired.\n\nIf anybody ever climbs up here and doesn't shoot first, I might just listen to " +
        "what they have to say.",
    },
    {
      id: "q_note_curator_catalog",
      type: "note",
      name: "Met Exhibit Placard",
      title: "THE METROPOLITAN MUSEUM OF ART — FEATURED EXHIBITION",
      text:
        '"TOMORROWLAND, U.S.A.: THE MIGHTY ATOMIC HOME, 1945–1967"\nSponsored by Atlas Power & Light\n\nGallery 1: The Kitchen of Tomorrow ' +
        "(it was there, you just couldn't afford it)\nGallery 2: The Car of Tomorrow\nGallery 3: The Shelter of Tomorrow\nGallery 4: CLOSED FOR " +
        "RENOVATION (please disregard the glow)\n\nThe Museum reminds patrons that the security robots are programmed for courtesy.",
    },
    {
      id: "q_note_ossie_sign",
      type: "note",
      name: "Ferry Sign",
      title: "OSSIE'S LIBERTY FERRY",
      text:
        "DEPARTS: When Ossie feels like it\nARRIVES: Probably\nFARE: 100 scrip (round trip, no refunds for the return trip if you die)\n\n" +
        "Life jackets available on request. We do not have any life jackets. Please do not request them.",
    },
    {
      id: "q_note_crane_log",
      type: "note",
      name: "Colonel Crane's Log",
      title: "LIBERTY STATION — COMMANDING OFFICER",
      text:
        "The old man talks to me as if I were a child who has broken something. Perhaps I am. I was eleven the day the world broke, and " +
        "I was told it would be fixed by men like my father.\n\nThe Array will fix it. Not the way Marlow wants — a sky scrubbed for everyone, " +
        "Brutes and raiders and the Neon's uncounted dancing in the clean rain — but properly. By the rolls. America as it was counted in 1967.\n\n" +
        "Hale asked me this morning whether her own name is on the 1967 rolls. I told her to see to the generators.\n\n" +
        "The sleeper will come. They always come. When he does, I will offer him a place in history. It is more than history offered me.",
    },
  ];

