// play-inline-566 01 — anchors
// Lines 17-341 of readable/play-inline-566.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const ms = L.ms;
  const first = () => String(L.heroName()).split(" ")[0];
  const last = () => String(L.heroName()).split(" ").pop();
  const stage = (id) => Q.stage(id);
  const at = (id, s) => Q.isActive(id) && Q.stage(id) === s;
  const IX = (k) =>
    (G.LAYOUT.INTERIORS[k] && G.LAYOUT.INTERIORS[k].origin) || {
      x: 0,
      y: 0,
      z: 0,
    };

  // ------------------------------------------------------------------
  // Places (anchors first, fallbacks after)
  // ------------------------------------------------------------------
  const GC = { x: 240, z: -230 };
  const TUDOR = { x: 311, z: -162 };
  const P = {
    tcEntrance: {
      site: "tudor_city",
      anchors: ["ext_entrance", "ext_stairs"],
      fallback: { x: 298, z: -150 },
    },
    tcRoof: {
      site: "tudor_city",
      anchors: ["rose_nook", "ext_roof"],
      fallback: { x: 316, z: -168 },
    },
    apt9c: () => ({
      site: "tudor_city",
      anchors: ["apt_9c", "loot3", "spawn4"],
      fallback: { x: IX("tudor_city").x + 2, z: IX("tudor_city").z - 12 },
    }),
    aptCal: () => ({
      site: "tudor_city",
      anchors: ["apt_9c_calendar", "apt_9c", "loot3"],
      fallback: { x: IX("tudor_city").x + 2, z: IX("tudor_city").z - 12 },
      dx: 0.8,
    }),
    aptDesk: () => ({
      site: "tudor_city",
      anchors: ["apt_9c_desk", "apt_9c", "loot3"],
      fallback: { x: IX("tudor_city").x + 2, z: IX("tudor_city").z - 12 },
      dx: -0.8,
    }),
    aptRecord: () => ({
      site: "tudor_city",
      anchors: ["apt_9c_record", "apt_9c", "loot3"],
      fallback: { x: IX("tudor_city").x + 2, z: IX("tudor_city").z - 12 },
      dz: 0.8,
    }),
    solDesk: () => ({
      site: "tudor_city",
      anchors: ["sol_desk", "entrance"],
      fallback: { x: IX("tudor_city").x, z: IX("tudor_city").z + 9 },
    }), // sol_desk is his standing spot
    unPlaza: {
      site: "un_hq",
      anchors: ["plaza", "npc2", "entrance"],
      fallback: { x: 288, z: -312 },
    },
    unGate: {
      site: "un_hq",
      anchors: ["gate", "flagpoles"],
      fallback: { x: 284, z: -296 },
    },
    booth: () => ({
      site: "un_assembly",
      anchors: ["booth_four", "booths", "npc1", "loot1"],
      fallback: { x: IX("un_assembly").x + 6, z: IX("un_assembly").z - 10 },
    }),
    gcGallery: {
      site: "grand_central",
      anchors: ["whispering_gallery", "oyster_bar", "bar"],
      fallback: { x: 222, z: -232 },
    },
    gcStair: {
      site: "grand_central",
      anchors: ["lower_stair", "track61_bulkhead", "stairs_down"],
      fallback: { x: 254, z: -214 },
    },
    gcMort: {
      site: "grand_central",
      anchors: ["shoeshine", "npc5", "info_booth"],
      fallback: { x: 248, z: -222 },
    },
    stpSteps: {
      site: "st_patricks",
      anchors: ["steps", "entrance", "door"],
      fallback: { x: 126, z: -342 },
    },
  };
  const markAt = (spec, label) => () => {
    const s = typeof spec === "function" ? spec() : spec;
    return [{ anchor: [s.site, s.anchors], fallback: s.fallback, label }];
  };

  // ------------------------------------------------------------------
  // Notes, letters, items
  // ------------------------------------------------------------------
  // mq01: locker 7 (Eli's own), mq02: the gallery memory + INFO-BOT
  ms.note({
    id: "ms_note_photo_strip",
    name: "Photo-Booth Strip (New Year's 1967)",
    title: "Four for a quarter — Grand Central arcade, 1 January 1967",
    text:
      "Four frames, black and white, the edges soft from your thumb.\n\n1. The two of you, very serious, as if for a passport. She has her chin up; you have your hat on.\n" +
      "2. She is laughing at something you said, head back, and you can see the gap between her front teeth she always said she'd get fixed and never did.\n" +
      "3. She is kissing your cheek. You look like a man who has been hit by a streetcar and liked it.\n4. A blur. She grabbed the curtain.\n\n" +
      'On the back, in green ink: "1.1.67 — next year in two rooms in Flatbush." And a small sun with twelve rays, one of them short.',
  });
  ms.note({
    id: "ms_note_nicole_letters",
    name: "Nicole's Letters (three)",
    title: "From N. Mead, 5 Tudor City Place, Apt. 9C, New York 17",
    text:
      "[Three letters in a rubber band, the envelopes addressed in green ink. The return address on every one: N. Mead, 5 Tudor City Place, Apt. 9C.]\n\n" +
      "— 12 December 1966 —\n{FIRST}, chéri: the Soviet delegate fell asleep in the Fourth Committee and I had to interpret his snoring into English. Nell says this is the most important thing a woman has ever done at the UN. Come to dinner Sunday. Bring the bad jokes. A dimanche.\n\n" +
      "— 30 January 1967 —\nYou signed it, didn't you. The government freezer. Ninety days. Don't tell me it's for the money — I know it's for the money, and I know what the money is for, and I am not going to say it in a letter in case I'm wrong. A dimanche.\n\n" +
      "— 17 February 1967 —\nNinety days. I have counted them on Nell's calendar and drawn a line through none of them yet. I will keep the light on. Somebody has to. Gallery, Sunday, ten o'clock, your corner and mine.\n\n[Each letter is signed the same way: no name, only a small sun with twelve rays.]",
  });
  ms.item({
    id: "ms_grandmother_ring",
    type: "misc",
    name: "Grandmother's Ring",
    weight: 0,
    value: 0,
    quest: true,
    desc: "Your grandmother's ring, a thin gold band with a garnet, bought back from a Flatbush Avenue pawnshop with the Long Winter bonus. You meant to give it to Nicole on thaw day, Sunday the 21st of May, 1967, in the Whispering Gallery. The box still smells of the pawnshop.",
  });
  ms.note({
    id: "ms_note_memory_gallery",
    name: "Memory: The Whispering Gallery, 19 February 1967",
    title: "Sunday 19 February 1967, 10 p.m. — Grand Central",
    text:
      "She stood in the far corner, facing the tiles, and you stood in yours, and the arch carried every word forty feet across the rush-hour nobody.\n\n" +
      "{FIRST}: Can you hear me?\nNICOLE: Every word. Even the ones you're not saying.\n{FIRST}: Ninety days. Wake me when it's spring.\nNICOLE: I'll keep the light on.\n" +
      "{FIRST}: I'm not supposed to tell anyone where. ...Under the Municipal Building. Pod seven.\nNICOLE: Pod seven. I'll knock.\n{FIRST}: You'll wake the whole program.\nNICOLE: Good.\n" +
      "NICOLE: {FIRST}? A dimanche.\n{FIRST}: That's Sunday. I'll be asleep on Sunday.\nNICOLE: Then a dimanche, whichever Sunday you wake up on.\n\n" +
      "You turned round first. She was already crossing the ramp in her green coat, not looking back, because she never looked back at goodbyes. She had said she had something to tell you on thaw day. You thought it was about the ring.",
  });
  ms.note({
    id: "ms_note_infobot_lost",
    name: "INFO-BOT: Lost Persons Board (1967–68)",
    title: "GRAND CENTRAL INFORMATION — LOST PERSONS",
    text: "SEARCH: MEAD, NICOLE\nRESULTS: 1\n\nMEAD, NICOLE: INQUIRE TRACK 61.\n\nTHERE IS NO TRACK 61. PLEASE DISREGARD.\n\n[Entry posted 1968. Author not logged. Handwriting: neat.]",
  });
  ms.note({
    id: "ms_note_9c_calendar",
    name: "Calendar from Apartment 9C (1967)",
    title: "PAN AM WALL CALENDAR, 1967 — kitchen wall, 9C",
    text:
      "The calendar never got past March. Somebody has written in it in a quick, slanting hand, mostly in green ink.\n\n" +
      "FEB 4 — Nell's birthday. Cake. NOT the rum one again.\n" +
      "FEB 19 — G.C. Whispering Gallery 10 pm. [a small sun with twelve rays]\n" +
      "FEB 20 — he goes under. 90 days. Don't cry at work.\n" +
      "MAR 4 — Dr. Weiss: OUI!! [underlined three times]\n" +
      "MAR 5 — Booth 4, 7 a.m. (emergency session, Sunday!!)\n" +
      "MAY 21 — Whispering Gallery. Tell him.\n\n" +
      "[Every day from February 20th onward has been crossed off with a single neat line, up to March 4th. March 5th has no line.]",
  });
  ms.note({
    id: "ms_note_nell_desk",
    name: "Note on Nell Brady's Desk",
    title: "Reporter's notebook page, torn out",
    text:
      "N. Brady — World-Telegram\n\nBlackwell's Island, the Octagon. Committed Feb 19 (Nicky's goodbye night — she'll kill me).\nLong Winter? Who runs it? OCD? Why the asylum?\n" +
      "Nicky says her fella can't tell her ANYTHING. \"Ninety days in a freezer and nobody will tell me why.\" So I'll find out.\n\n" +
      'Leave key with Sol. Ten days. Back by the 1st.\n\n[Under it, in green ink: "Nell — you are an idiot and I love you. Come home. N."]',
  });
  ms.note({
    id: "ms_note_nicole_1968",
    name: "Nicole's Letter (kept by Sol)",
    title: "To E., c/o the doorman, 5 Tudor City Place — 10 March 1968",
    text:
      "{FIRST},\n\nIf you're reading this, the spring came late.\n\nI knocked. I want you to know that first. I went to your door under the Municipal Building on the 20th and asked for pod seven, and nobody opened, and I sat there until my candle went out.\n\n" +
      "I did a terrible thing to keep something of ours alive. I won't write it down. Sol will tell you the parts he saw, and the rest is mine to carry.\n\n" +
      "Don't look for me. I'm not the girl in the photograph any more. She had both her hands and a job and a boy who made bad jokes about winter, and I don't know where she went.\n\n" +
      "Keep the light on. Somebody has to.\n\nA dimanche.\n\n[Signed with a small sun with twelve rays, drawn twice, as if the first one wasn't right.]",
  });
  ms.item({
    id: "ms_record_two_bits",
    type: "misc",
    name: 'Record: "Two Bits and a Kiss"',
    weight: 0.5,
    value: 0,
    desc: "A 45 in a paper sleeve. On the sleeve, in green ink, a fourth verse that was never on any record: \"Two bits for the jukebox, a kiss for the dark, / a match for the candle, a light for the park; / and when you come home from the long winter's keep, / I'll sing you awake, love. Till then, go to sleep.\" Signed with a small sun.",
  });
  ms.item({
    id: "ms_flint_casing",
    type: "misc",
    name: "Spent Rifle Casing",
    weight: 0,
    value: 0,
    desc: "A .308 casing, still warm when you found it on the fire escape, with a strip of white tape around it — tape cut from the casing of a neon tube. Somebody marks their brass.",
  });
  ms.note({
    id: "ms_note_glow_tract",
    name: "Glowkeeper Tract",
    title: "THE LIGHT KEEPS",
    text:
      "[A hand-printed tract on brown paper. At the top, inked by hand, a small sun with twelve rays: exactly the sun on Nicole's letters, down to the short ray at four o'clock where the pen always skipped.]\n\n" +
      "BROTHER, SISTER, SLEEPER:\nThe first sun rose over the Bronx on a Sunday, and the city that was went into the Light.\nThe Second Sun is patient.\nSomebody has to keep the light on.\nCome to the Cathedral of the Second Sun, Fifth Avenue at Fiftieth. Bring a candle or we will give you one.",
  });
  ms.note({
    id: "ms_note_ilse_steno",
    name: "Nicole's Steno Pad (Booth Four)",
    title: "Interpreter's steno pad — N. MEAD — Sunday 5 March 1967",
    text:
      "Pitman shorthand, transcribed in the margin in Ilse Moravec's small upright hand.\n\n" +
      '07:02 Emergency session convened. Pres. of the GA: "radar contacts, Atlantic, inbound."\n' +
      '07:40 French delegate (Mme Arnaud) — demands the floor. "France has given no such order."\n' +
      "08:30 US Civil Defense liaison (seat behind US delegation) gets up and leaves. Takes his hat. Doesn't look at anyone. [In the margin, in Nicole's own longhand: \"like a man who knew the time\"]\n" +
      '09:12 Soviet delegate: "We are not involved and we will not be blamed."\n' +
      '09:41 French delegate, quietly, off the record but into my headset: "These aircraft did not leave from Paris."\n\n' +
      '[The last line is not shorthand. It\'s a doodle: a small sun with twelve rays, and under it a word, "OUI", crossed out and written again.]',
  });
  ms.note({
    id: "ms_note_gc_grate",
    name: "Through the Grate (Grand Central lower level)",
    title: "Notice wired to the grate, lower-level stair",
    text:
      "LOWER LEVEL CLOSED BY ORDER OF THE OCD.\nRELIEF STATION RIOT, 5 MARCH 1968.\nNO ADMITTANCE. NO EXCEPTIONS. NO CANDLES.\n\n" +
      "[Beyond the grate, the stair goes down into the dark. The wall at the first landing is solid wax: a whole wall of candles melted into each other, years deep, some stubs still standing in it like teeth. Above the wax someone has chalked a sun with twelve rays. The chalk is not old.]",
  });
  ms.note({
    id: "ms_note_dawn_reply",
    name: "Reply to Your Notice (sealed)",
    title: "For the sleeper — c/o Radio Free Manhattan",
    text:
      "[Heavy cream paper folded in three, sealed with candle wax. The seal is a sun with twelve rays, pressed with a carved stamp, and one ray at four o'clock is shorter than the rest.]\n\n" +
      "Stop looking.\n\nShe is in the Light.\n\n[No signature. The hand is careful and square, like someone writing with the hand they weren't born using.]",
  });
  ms.note({
    id: "ms_note_dawn_hour_1",
    name: "Transcript: the Dawn Hour (printed by the Glowkeepers)",
    title: 'THE DAWN HOUR — 05:47 — "On Keeping"',
    text:
      "Good morning, children. It is five forty-seven, and the Sun has been patient with us for one more night.\n\n" +
      "I want to tell you about keeping. Every one of you keeps something: a name, a photograph, a key you cannot use. You think the keeping is a weight. It is not. It is a light.\n\n" +
      "Somebody has to keep the light on. In the dark, in the cold, in the long winter, somebody always has, and somebody always will, and this morning it is you.\n\n" +
      "The sleepers sleep. We do not wake them. We keep the light on, and we wait, and the Sun does not choose who it shines on.\n\n" +
      "A dimanche, children. Go and be warm.",
  });

  // ------------------------------------------------------------------
  // The Tudor City household: Sol and the Unkindled (later acts use them too)
  // ------------------------------------------------------------------
  const houseOn = () => Q.isStarted("mq07") || L.flag("ms_rose_met");
  ms.actor({
    id: "ms_sol",
    when: houseOn,
    def: () => ({
      type: "sol_abramowitz",
      preset: "sol",
      name: "Sol Abramowitz",
      gender: "m",
      outfit: "settler",
      age: 70,
      hat: "cap",
      faction: "raiders",
      hostile: false,
      essential: true,
      ai: "static",
      level: 6,
      dialogue: "dlg_ms_sol",
      at: Object.assign({ maxR: 4 }, P.solDesk()),
      barks: [
        "Tudor City. Mind the step, it's been loose since Truman.",
        "Door's open. Door's always open. That's the job.",
        "You wipe your feet. Even now.",
      ],
    }),
  });
  const UNKINDLED = [
    {
      id: "ms_jory",
      name: "Jory",
      gender: "m",
      age: 17,
      hair: "wild",
      line: [
        "Flint says you're all right. Flint says that about nobody.",
        "I used to light four hundred candles a night. Now I light one sign.",
      ],
    },
    {
      id: "ms_pockets",
      name: "Pockets",
      gender: "f",
      age: 14,
      hair: "bob",
      line: [
        "Got anything? I collect anything.",
        "Don't tell the Court I took the batteries.",
      ],
    },
    {
      id: "ms_beanie",
      name: "Beanie",
      gender: "m",
      age: 12,
      hair: "short",
      hat: "beanie",
      line: [
        "I can see the river from here. And the sun people's boats.",
        "Is it true you were frozen? Like a fish?",
      ],
    },
    {
      id: "ms_ash",
      name: "Ash",
      gender: "f",
      age: 19,
      hair: "short",
      line: [
        "We ran. Some nights I still wake up at five forty-seven.",
        "Watch the gap. The sign's further out than it looks.",
      ],
    },
  ];
