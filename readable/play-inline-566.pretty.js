/* src/quests/62_ms_act1.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 62: MAIN STORY, ACT I "THAW" (mq07–mq10)
 *   n4  mq07 "The Court of Tudor City"  — Nicole's apartment 9C; Flint (Rose)
 *                                         holds a rifle on him; Sol's 1968 letter
 *   n5  mq08 "Booth Four"               — the UN: Lt. Hale's offer; Ilse Moravec;
 *                                         Nicole's steno pad from 5 March 1967
 *   n6  mq09 "The Candle Lady"          — Grand Central's old-timers; the Sixty-One
 *                                         Camp; the sealed stair; Lys
 *   n7  mq10 "Return to Sender"         — a reply sealed with Nicole's sun; the
 *                                         Cathedral of the Second Sun; the Dawn Hour
 * Also: the Chambers Street watcher + rooftop shot right after mq01, the
 * Tudor City household (Sol Abramowitz, the Unkindled) used by later acts.
 * mq01–mq03 live in 20_cryo.js / 30_midtown.js. Toolkit: L.ms (61_ms_core.js).
 * ===================================================================== */
(function () {
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
  UNKINDLED.forEach((u, i) => {
    ms.actor({
      id: u.id,
      when: houseOn,
      def: () => ({
        type: "unkindled_" + u.name.toLowerCase(),
        preset: "unkindled",
        name: u.name,
        gender: u.gender,
        age: u.age,
        hair: u.hair,
        hat: u.hat,
        outfit: "drifter",
        faction: "raiders",
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 3,
        level: 4,
        weapon:
          i === 3
            ? ["hunting_rifle", "bolt_rifle_32"]
            : ["bolt_rifle_32", "pistol_32"],
        dialogue: "dlg_ms_unkindled",
        at: {
          site: "tudor_city",
          anchors: ["unkindled" + (i + 1), "ext_roof"],
          fallback: { x: 316 + (i - 1.5) * 2.2, z: -166 + (i % 2) * 2 },
          maxR: 6,
        },
        barks: u.line,
      }),
    });
  });
  ms.dlg("dlg_ms_unkindled", "hi").add({
    hi: {
      text: (a) => {
        const n = a && a.name;
        if (n === "Jory")
          return "Jory. I run messages. Four years out of the tunnels and I still count candles in my sleep. Flint's up on the gantry if you want her. You don't want her when she's on the gantry.";
        if (n === "Pockets")
          return "Pockets. Because of the pockets. [She has eleven.] I don't do candles. We don't do candles here. We do sparks.";
        if (n === "Beanie")
          return "I'm Beanie. I'm twelve. I was born down there, same as Flint. Same as everybody. We call ourselves the Unkindled. Flint made it up. It means we didn't burn.";
        return "Ash. I'm the oldest, after Flint. If you're here for trouble, we've got four rifles and a very long drop. If you're here for Flint, she'll decide.";
      },
      responses: [
        { text: "What are the Unkindled?", next: "what" },
        { text: "See you around." },
      ],
    },
    what: {
      text: "Kids who got out. The sun people raise you to sing in the dark and wait for the Light. Some of us stopped waiting. Flint got out first. She came back for the rest of us, one at a time, through the tunnels, with that rifle. So: we keep her sign lit, and the Court lets us sleep on the roof.",
      responses: [
        { text: "She came back for you.", next: "back" },
        { text: "Thanks." },
      ],
    },
    back: {
      text: "Every one. She says it was for the practice. [A shrug.] She says a lot of things.",
      responses: [{ text: "Thanks." }],
    },
  });

  // Sol's composite dialogue
  const SOL = ms.dlg("dlg_ms_sol", "idle");
  SOL.add({
    idle: {
      speaker: "Sol Abramowitz",
      text: () =>
        L.flag("ms_sol_letter_given")
          ? [
              "Mind the step.",
              "She still has her old key, you know. Flint. To 9C. I never asked for it back.",
              "Twenty-two years I kept that letter dry. Felt good to hand it over. Felt terrible.",
            ][Math.floor(Math.random() * 3)]
          : "Tudor City, five Tudor City Place. I'm Sol. I was the doorman here before the Bombing and I'm the doorman here now. The building got worse. The job didn't change.",
      responses: [
        {
          text: "Tell me about Nicole Mead.",
          next: "nicole",
          cond: () => Q.isStarted("mq07") && !L.flag("ms_sol_letter_given"),
        },
        {
          text: "How long have you known Flint?",
          next: "flint",
          cond: () => !!L.flag("ms_rose_met"),
        },
        { text: "Take care, Sol." },
      ],
    },
    nicole: {
      text: "9C. Miss Mead and Miss Brady. The French girl — Canadian, she'd correct you — and the reporter. Miss Mead tipped at Christmas in chocolate and wrote me a card every year with a little sun on it. [He looks at your suit a long time.] And you're the fella. The freezer fella. She showed me your picture so I'd let you up without calling. You never came. Then nobody came.",
      onEnter() {
        if (at("mq07", "sol")) L.setFlag("ms_sol_talked");
      },
      responses: [
        { text: "Did she come back here after the Bombing?", next: "back" },
        { text: "I need to know what happened to her.", next: "back" },
      ],
    },
    back: {
      text: "Twice. Autumn of '67 she came up the back stairs round as a harvest moon, laughing at me for staring. Took some things from 9C and went back down to wherever she was living. Underground somewhere. The station. Then spring of '68, March, she came again with a baby on her hip and her hand wrapped in rags, and she wasn't laughing. She gave me a letter. \"For when he wakes up,\" she said. I said, Miss Mead, he's not waking up. She said, \"Then you'll have it forever, Sol, and that's a nice thing to have.\"",
      responses: [{ text: "You kept it. Twenty-one years.", next: "letter" }],
    },
    letter: {
      text: "In my coat, in the inside pocket, wrapped in a bread bag. Two fires and a flood. [He takes out a folded envelope, soft as cloth, and holds it a moment before he gives it to you.] Your name's on the front. Well. Your first name. She didn't need the rest.",
      onEnter() {
        if (!L.has("ms_note_nicole_1968")) L.give("ms_note_nicole_1968", 1);
        L.setFlag("ms_sol_letter_given");
        if (at("mq07", "sol")) Q.setStage("mq07", "letter");
      },
      responses: [
        { text: "[Read it now.]", next: "read" },
        { text: "Thank you, Sol." },
      ],
    },
    read: {
      speaker: "",
      text: () =>
        G.items && G.items.get && G.items.get("ms_note_nicole_1968")
          ? G.items.get("ms_note_nicole_1968").text
          : "",
      onEnter() {
        readLetter();
      },
      responses: [{ text: "[Fold it up again.]", next: "after" }],
    },
    after: {
      speaker: "Sol Abramowitz",
      text: "The baby had a little red hat. Somebody knitted it. That's all I know. [He does not look at you.] That's all I know.",
      responses: [{ text: "...Thank you." }],
    },
    flint: {
      text: "Five years. She came up the elevator shaft one night in '84, sixteen, soaked, with a burned wrist she wouldn't let me look at, and asked if 9C was still empty. I said it's been empty since before you were born, kid. She said \"I know.\" [He shrugs.] So I gave her the roof. The Court doesn't argue with me. I'm the only one who knows how the boiler works.",
      responses: [{ text: "Thanks, Sol." }],
    },
  });
  function readLetter() {
    if (!L.flag("ms_letter_read")) {
      L.setFlag("ms_letter_read");
      L.xp(40, "Nicole's letter");
    }
    if (at("mq07", "letter") || at("mq07", "sol")) Q.complete("mq07");
  }
  G.events.on("noteRead", (id) => {
    if (id === "ms_note_nicole_1968") readLetter();
    if (id === "ms_note_dawn_hour_1" && at("mq10", "dawnhour"))
      dawnHourHeard("transcript");
  });

  // ------------------------------------------------------------------
  // Chambers Street: the watcher and the rooftop shot (right after mq01)
  // ------------------------------------------------------------------
  function cryoOut() {
    return G.LAYOUT.cryoExit || { x: 150, z: 588 };
  }
  const spotAt = {}; // Chambers Street spot positions (computed once the world is built)
  function watcherSpot() {
    const X = cryoOut();
    return L.freeSpot(X.x - 6, X.z - 16, undefined, { maxR: 8 });
  }
  ms.actor({
    id: "ms_taper_chambers",
    removeWhenOff: true,
    when: () => !!L.flag("ms_watcher_scene") && !L.flag("ms_watcher_fled"),
    def: () => ({
      type: "brother_taper",
      preset: "taper",
      name: "Robed Watcher",
      gender: "m",
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: false,
      essential: true,
      ai: "static",
      level: 5,
      pos: watcherSpot(),
      barks: ["..."],
    }),
  });
  L.hook("update", function () {
    if (!L.flag("left_cryo") || L.flag("ms_watcher_scene") || !G.player) return;
    const X = cryoOut(),
      p = G.player.pos;
    if (p.x >= G.LAYOUT.INTERIOR_X_MIN || Math.hypot(p.x - X.x, p.z - X.z) > 30)
      return;
    L.setFlag("ms_watcher_scene");
    ms.pollRoster();
    L.later(3.5, () => {
      const a = L.npc("ms_taper_chambers");
      if (a && a.faceTowards) {
        try {
          a.faceTowards(p.x, p.z);
        } catch (e) {
          /* */
        }
      }
      L.notify(
        "Across Chambers Street a man in grey robes stands very still, a lantern raised in one hand, as if to see your face better. A twelve-ray sun is stitched on his breast.",
        { duration: 7 },
      );
    });
    L.later(10, () => {
      L.sfx("gunshot_rifle_far", { volume: 0.9 });
      L.sfx("glass_break", { volume: 0.6 });
      L.notify(
        "CRACK. A rifle, somewhere high. The watcher's lantern bursts in his hand. He drops it and runs north, robes flapping, into the Ruins.",
        { duration: 7 },
      );
      const a = L.npc("ms_taper_chambers");
      if (a && a.moveTo) {
        try {
          a.moveTo(a.pos.x + 4, a.pos.z - 60);
        } catch (e) {
          /* */
        }
      }
      L.setFlag("ms_watcher_shot");
    });
    L.later(16, () => {
      L.setFlag("ms_watcher_fled");
      ms.pollRoster();
    });
  });
  ms.spot({
    id: "ms_spot_watcher",
    label: "The watcher's trail",
    verb: "Chase",
    when: () => !!L.flag("ms_watcher_shot") && !L.flag("ms_watcher_chased"),
    at: () => spotAt.ms_spot_watcher || null,
    use() {
      ms.talk("dlg_ms_chambers", "Chambers Street", "chase");
    },
  });
  ms.spot({
    id: "ms_spot_shooter",
    label: "Fire escape",
    verb: "Search",
    when: () => !!L.flag("ms_watcher_shot") && !L.flag("ms_saw_shooter_done"),
    at: () => spotAt.ms_spot_shooter || null,
    use() {
      ms.talk("dlg_ms_chambers", "Chambers Street", "shooter");
    },
  });
  ms.dlg("dlg_ms_chambers", "chase").add({
    chase: {
      speaker: "",
      text: "The lantern lies in the slush where he dropped it, still smoking. His tracks go north between the burned cars.",
      responses: [
        {
          text: "[Reflex 6] Run him down.",
          check: { attr: "reflex", value: 6 },
          next: "caught",
          failNext: "lost",
        },
        {
          text: "[Stealth 25] Follow him quietly.",
          check: { skill: "stealth", value: 25 },
          next: "caught",
          failNext: "lost",
        },
        { text: "[Let him go.]", action: () => L.setFlag("ms_watcher_chased") },
      ],
    },
    caught: {
      text: "Two blocks north he ducks into a doorway and out the back, and he's gone — but in the doorway, dropped in his hurry, is a fold of brown paper.",
      onEnter() {
        L.setFlag("ms_watcher_chased");
        ms.set("saw_watcher");
        if (!L.has("ms_note_glow_tract")) L.give("ms_note_glow_tract", 1);
        L.xp(25, "Chased the watcher");
      },
      responses: [{ text: "[Unfold it.]", next: "tract" }],
    },
    tract: {
      text: "A tract. At the top, inked by hand, a small sun with twelve rays. You know that sun. You have three letters in your pocket signed with it, and the short ray at four o'clock is short on this one too.",
      responses: [{ text: "...That's her sun." }],
    },
    lost: {
      text: "Two blocks north the tracks run into a crowd of burned-out buses and simply stop. There's a smell of candle smoke and nothing else.",
      onEnter() {
        L.setFlag("ms_watcher_chased");
      },
      responses: [{ text: "[Give up.]" }],
    },
    shooter: {
      speaker: "",
      text: "The shot came from the fire escape on the old Hall of Records side. You climb two flights. On the third landing: a square of cardboard to kneel on, a bootprint, and a single spent casing.",
      onEnter() {
        L.setFlag("ms_saw_shooter_done");
        ms.set("saw_shooter");
        if (!L.has("ms_flint_casing")) L.give("ms_flint_casing", 1);
        L.xp(25, "Found the shooter's nest");
      },
      responses: [{ text: "[Look at the casing.]", next: "casing" }],
    },
    casing: {
      text: "A rifle casing, a strip of white tape wound round it. Neon-tube tape. Somebody marks their brass, and somebody was waiting up here for you, or for him.",
      responses: [{ text: "[Pocket it.]" }],
    },
  });

  // ------------------------------------------------------------------
  // QUESTS
  // ------------------------------------------------------------------
  L.hook("init", function () {
    // ---------------- mq07 The Court of Tudor City ----------------
    ms.quest({
      id: "mq07",
      giver: "Nicole's letters (return address)",
      location: "Tudor City",
      desc: () =>
        "Nicole's letters all carry the same return address: N. Mead, 5 Tudor City Place, apartment 9C, on the bluff above First Avenue. " +
        'Tudor City is a raider "Court" now, ruled by a Lord Protector who makes visitors kneel. If anything of Nicole is left in this city, it starts in 9C.',
      stages: [
        {
          id: "court",
          text: "Get into Tudor City: kneel and pay the Court, talk your way in, fight, or come in over the roof sign.",
          markers: () => [
            { npc: "ms_court_herald", label: "The Court's Herald" },
            {
              anchor: [P.tcEntrance.site, P.tcEntrance.anchors],
              fallback: P.tcEntrance.fallback,
              label: "Tudor City",
            },
          ],
          onEnter() {
            L.hint(
              "ms_court",
              'Tudor City\'s raiders answer to a "Lord Protector". His herald at the door takes tribute; there is also a way in over the roof.',
              4,
            );
          },
        },
        {
          id: "apt",
          text: "Search apartment 9C.",
          markers: markAt(P.apt9c, "Apartment 9C"),
        },
        {
          id: "flint",
          text: "Face the woman with the rifle.",
          markers: () => ms.rose.marker("The woman with the rifle"),
          onEnter() {
            ms.rose.place("at", P.apt9c());
            L.later(0.6, () => ms.rose.say("Don't. Move."));
          },
        },
        {
          id: "sol",
          text: "Talk to Sol, the doorman, in the lobby.",
          markers: () => [{ npc: "ms_sol", label: "Sol Abramowitz" }],
        },
        {
          id: "letter",
          text: "Read Nicole's 1968 letter (goggles → NOTES).",
          markers: () => [{ npc: "ms_sol", label: "Sol Abramowitz" }],
        },
        {
          id: "c_kneel",
          text: "(Optional) Kneel and pay the Court.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => L.flag("ms_court") === "knelt",
        },
        {
          id: "c_talk",
          text: "(Optional) Talk your way past the Court.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => L.flag("ms_court") === "talked",
        },
        {
          id: "c_roof",
          text: "(Optional) Come in over the roof sign.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => L.flag("ms_court") === "roof",
        },
        {
          id: "record",
          text: "(Optional) Take the record from 9C.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq07", "apt") && !ms.hasToken("record"),
          doneIf: () => ms.hasToken("record"),
        },
      ],
      rewards: { xp: 350 },
      onComplete() {
        ms.rose.place("home");
        L.news(
          "Rocky here with a lost-and-found. A certain sleeper was seen climbing the steps at Tudor City and walking back down with all his teeth. The Lord Protector's Court reports \"no incident.\" The Lord Protector's Court reports that every day.",
        );
      },
    });

    // ---------------- mq08 Booth Four ----------------
    ms.quest({
      id: "mq08",
      giver: "Lt. Vesper Hale / Ilse Moravec",
      location: "United Nations Plaza",
      desc: () =>
        'Nicole was an interpreter at the United Nations: Booth Four, French into English. The UN is the Continuity\'s forward command now, and Lieutenant Hale has been waiting to meet "the second sleeper". ' +
        "Somebody there may still remember the woman in Booth Four.",
      stages: [
        {
          id: "hale",
          text: "Go to the UN Plaza and hear Lieutenant Hale out (you don't have to take her deal).",
          markers: () => [
            { npc: "con_hale", label: "Lieutenant Hale" },
            {
              anchor: [P.unPlaza.site, P.unPlaza.anchors],
              fallback: P.unPlaza.fallback,
              label: "UN Plaza",
            },
          ],
          onEnter() {
            ms.rose.place("at", P.unGate);
          },
        },
        {
          id: "ilse",
          text: "Find Ilse Moravec, Nicole's old booth partner.",
          markers: () => [{ npc: "ms_ilse", label: "Ilse Moravec" }],
        },
        {
          id: "booth",
          text: "Reach Booth Four in the General Assembly Hall (Maniacs in the gallery).",
          markers: markAt(P.booth, "Booth Four"),
          onEnter() {
            L.hint(
              "ms_booth",
              "The Assembly Hall's public gallery is full of Maniacs. The Continuity guards will leave you alone while you're Hale's guest.",
              2,
            );
          },
        },
        {
          id: "steno",
          text: "Read Nicole's steno pad with Ilse.",
          markers: () => [{ npc: "ms_ilse_booth", label: "Ilse Moravec" }],
        },
        {
          id: "tell",
          text: "(Optional) Tell Hale why you are really here.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq08", "ilse"),
          doneIf: () => !!L.flag("ms_con_knows_nicole"),
          markers: () => [{ npc: "con_hale", label: "Lieutenant Hale" }],
        },
        {
          id: "keep",
          text: "(Optional) Keep the steno pad.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq08", "steno"),
          doneIf: () => ms.hasToken("booth"),
        },
      ],
      rewards: { xp: 400 },
      onComplete() {
        ms.rose.place("home");
      },
    });

    // ---------------- mq09 The Candle Lady ----------------
    ms.quest({
      id: "mq09",
      giver: "Stationmaster Delphine Okafor",
      location: "Grand Central Market",
      desc: () =>
        "Nicole went to Grand Central on the afternoon of the Bombing, like half of Midtown. Grand Central's old-timers remember a shelter on the lower level in 1967 — and a woman there who gave every child a candle.",
      stages: [
        {
          id: "delphine",
          text: "Ask Stationmaster Delphine Okafor about the lower level.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
        {
          id: "oldtimers",
          text: () =>
            "Ask two more of Grand Central's old-timers about 1967: Doc Hollis, Mort Feldstein or Moe (" +
            oldtimers() +
            "/2).",
          markers: () =>
            [
              { npc: "gc_doc", label: "Doc Hollis" },
              { npc: "ms_mort", label: "Mort Feldstein" },
              { npc: "gc_moe", label: "Moe Kessler" },
            ].filter((m) => !L.flag("ms_ot_" + m.npc)),
          onEnter() {
            ms.pollRoster();
          },
        }, // Mort is at his bench the moment the stage opens
        {
          id: "grate",
          text: "Look through the grate of the sealed lower-level stair.",
          markers: markAt(P.gcStair, "Sealed stair"),
        },
        {
          id: "lys",
          text: "(Optional) Sit down with Lys at the Whistle Stop.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("ms_lys_noticed") || Q.reached("mq09", "oldtimers"),
          doneIf: () => !!L.flag("ms_lys_met"),
          markers: () => [{ npc: "bs_lys", label: "Mademoiselle Lys" }],
        },
        {
          id: "press",
          text: "(Optional) Press Doc Hollis about the mother's name.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_ot_gc_doc"),
          doneIf: () => !!L.flag("ms_hollis_named"),
          markers: () => [{ npc: "gc_doc", label: "Doc Hollis" }],
        },
      ],
      rewards: { xp: 400 },
      onComplete() {
        L.news(
          "Rocky here. Somebody's been asking the old-timers at Grand Central about 1967 — the Camp, the candles, the stair they bricked up. Folks, if you were down there, you know who you are. Maybe go and say hello to the man in the padded suit.",
        );
      },
    });

    // ---------------- mq10 Return to Sender ----------------
    ms.quest({
      id: "mq10",
      giver: '"Rocky" Delgado',
      location: "Radio City → St. Patrick's Cathedral",
      desc: () =>
        "Somebody answered your Missing Persons notice. The reply is waiting at Radio City, and Rocky says it smells of candle wax.",
      stages: [
        {
          id: "reply",
          text: "Collect the reply to your notice from Rocky at Radio City.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "compare",
          text: "Compare the seal with Nicole's letters.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "cathedral",
          text: "Go to St. Patrick's, the Cathedral of the Second Sun.",
          markers: markAt(P.stpSteps, "St. Patrick's Cathedral"),
          onEnter() {
            ms.rose.place("at", P.stpSteps);
          },
        },
        {
          id: "keeper",
          text: "Speak with Keeper Hollowell and Sister Noonday.",
          markers: () => [
            { npc: "glow_ezra", label: "Keeper Hollowell" },
            { npc: "glow_sister", label: "Sister Noonday" },
          ],
        },
        {
          id: "dawnhour",
          text: () =>
            "Hear the Dawn Hour at 05:47 on the radio (wait for morning) — or read the printed transcript." +
            (L.has("ms_note_dawn_hour_1")
              ? ""
              : " Sister Noonday hands them out."),
          markers: () =>
            L.has("ms_note_dawn_hour_1")
              ? []
              : [{ npc: "glow_sister", label: "Sister Noonday (transcripts)" }],
        },
        {
          id: "who",
          text: "(Optional) Ask who wrote the reply.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq10", "keeper"),
          doneIf: () => !!L.flag("ms_dawn_wrote_letter"),
        },
      ],
      rewards: { xp: 450, scrip: 60 },
      onComplete() {
        ms.rose.place("home");
      },
    });
  });

  // ------------------------------------------------------------------
  // mq07: the Court, 9C, Flint, Sol
  // ------------------------------------------------------------------
  ms.actor({
    id: "ms_court_herald",
    when: () =>
      Q.isActive("mq07") && stage("mq07") === "court" && !L.flag("ms_court"),
    def: {
      type: "human",
      name: "Herald of the Court",
      gender: "m",
      outfit: "raider",
      hat: "cap",
      faction: "raiders",
      hostile: false,
      essential: true,
      ai: "guard",
      home: "here",
      homeR: 2,
      level: 6,
      weapon: ["bolt_rifle_32"],
      dialogue: "dlg_ms_herald",
      at: Object.assign({ maxR: 6 }, P.tcEntrance),
      barks: ["Kneel for the Lord Protector!", "Tribute first. Then dignity."],
    },
  });
  function courtTruce() {
    const o = IX("tudor_city");
    L.factionTruce("raiders", o.x, o.z, 140, false, { id: "ms_court_in" });
    L.factionTruce("raiders", TUDOR.x, TUDOR.z, 45, false, {
      id: "ms_court_out",
    });
  }
  function passCourt(how) {
    if (!L.flag("ms_court")) L.setFlag("ms_court", how);
    if (how !== "fight" && how !== "roof") courtTruce();
    if (at("mq07", "court")) Q.setStage("mq07", "apt");
  }
  ms.dlg("dlg_ms_herald", "hail").add({
    hail: {
      speaker: "Herald of the Court",
      text: "HALT. You stand at the gate of the Court of Tudor City, seat of His Grace the Lord Protector, Keeper of the Steps, Warden of the Boiler. Kneel, and pay tribute, and you may enter. Or don't, and we see how far you fall.",
      responses: [
        {
          text: "[Kneel.] [Pay 40 scrip.]",
          cond: () => L.scrip() >= 40,
          action: () => {
            if (L.pay(40)) {
              L.notify(
                "You kneel on the cracked steps of Tudor City. The herald looks deeply satisfied.",
              );
              passCourt("knelt");
            }
          },
          next: "in",
        },
        {
          text: "[Presence 6] I'm not here to take anything from His Grace. I'm looking for a woman who lived in 9C.",
          check: { attr: "presence", value: 6 },
          next: "talked",
          failNext: "nope",
        },
        { text: "I'll find my own way in.", next: "own" },
      ],
    },
    in: {
      text: "His Grace thanks you for your tribute. Mind the step. The step has been loose since Truman.",
      responses: [{ text: "[Go in.]" }],
    },
    talked: {
      text: "...9C? Nobody goes to 9C. That's the Lamplighter's. [He lowers his rifle a little.] The Lamplighter don't like visitors. Fine. Go up. If she shoots you, it was her idea, not the Court's.",
      onEnter() {
        passCourt("talked");
        L.xp(30, "Presence: the Court");
      },
      responses: [
        { text: "Who's the Lamplighter?", next: "lamplighter" },
        { text: "[Go in.]" },
      ],
    },
    lamplighter: {
      text: "The Royal Lamplighter. Keeps His Grace's sign lit, up top. TUDOR CITY in red, the only lit sign on the East Side. In exchange, she gets the roof and nobody asks her questions. I am not asking her questions. You shouldn't either.",
      responses: [{ text: "[Go in.]" }],
    },
    nope: {
      text: "Everybody's looking for somebody. Kneel or walk.",
      responses: [
        {
          text: "[Kneel and pay 40 scrip.]",
          cond: () => L.scrip() >= 40,
          action: () => {
            if (L.pay(40)) passCourt("knelt");
          },
          next: "in",
        },
        { text: "I'll find my own way in.", next: "own" },
      ],
    },
    own: {
      text: "Then you'll find it with your face. [He spits.] Plenty have.",
      responses: [{ text: "[Leave.]" }],
    },
  });
  // Getting in by any route moves mq07 on: the Tudor City interior, or the roof under the sign.
  let tcT = 0;
  L.hook("update", function (dt, realDt) {
    tcT -= realDt;
    if (tcT > 0) return;
    tcT = 0.5;
    if (!G.player) return;
    const p = G.player.pos;
    if (at("mq07", "court")) {
      const o = IX("tudor_city");
      const inside =
        p.x >= G.LAYOUT.INTERIOR_X_MIN &&
        Math.hypot(p.x - o.x, p.z - o.z) < 120;
      const roof = ms.resolve(P.tcRoof);
      const onRoof =
        roof && Math.hypot(p.x - roof.x, p.z - roof.z) < 10 && p.y > 8;
      if (inside) passCourt(L.flag("ms_court") || "fight");
      else if (onRoof) passCourt("roof");
    }
    if (at("mq07", "apt")) {
      const a = ms.resolve(P.apt9c());
      if (
        a &&
        Math.hypot(p.x - a.x, p.z - a.z) < 6 &&
        Math.abs(p.y - (a.y || 0)) < 3
      ) {
        if (!L.flag("ms_9c_entered")) {
          L.setFlag("ms_9c_entered");
          L.notify(
            "Apartment 9C. Two narrow beds, one made, one not. A kitchen calendar. A record player with its lid up. Dust on everything except the windowsill.",
            { duration: 7 },
          );
        }
        if (L.has("ms_note_9c_calendar") || L.flag("got_ms_9c_cal"))
          Q.setStage("mq07", "flint");
      }
    }
  });
  ms.pickup({
    key: "ms_9c_cal",
    item: "ms_note_9c_calendar",
    when: () => Q.isStarted("mq07"),
    at: P.aptCal(),
  });
  ms.pickup({
    key: "ms_9c_desk",
    item: "ms_note_nell_desk",
    when: () => Q.isStarted("mq07"),
    at: P.aptDesk(),
  });
  ms.pickup({
    key: "ms_9c_record",
    item: "ms_record_two_bits",
    when: () => Q.isStarted("mq07"),
    at: P.aptRecord(),
  });
  G.events.on("itemAdded", (id) => {
    if (id === "ms_note_9c_calendar" && at("mq07", "apt"))
      Q.setStage("mq07", "flint");
    if (id === "ms_record_two_bits" && !ms.hasToken("record")) {
      ms.token("record");
      L.xp(10, "Two Bits and a Kiss");
    }
    if (id === "ms_note_ilse_steno" && !ms.hasToken("booth")) ms.token("booth");
    if (id === "ms_note_dawn_reply" && at("mq10", "reply"))
      Q.setStage("mq10", "compare");
  });

  // Rose's first meeting (9C): nodes in her composite tree
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() => (at("mq07", "flint") ? "mq07_meet" : null));
  RD.when(() =>
    at("mq08", "hale") || at("mq08", "ilse") ? "mq08_gate" : null,
  );
  RD.when(() =>
    Q.isActive("mq10") &&
    !L.flag("ms_rose_mq10_steps") &&
    (at("mq10", "cathedral") || at("mq10", "keeper"))
      ? "mq10_steps"
      : null,
  );
  RD.add({
    mq07_meet: {
      speaker: "The woman with the rifle",
      text: () =>
        "[A young woman sits on the unmade bed with a scoped rifle across her knees, and the muzzle is on your chest. Leather jacket, a cuff on her left wrist, hair pulled back hard. She does not blink.] " +
        "That's far enough. This is a private apartment. Whose door did you think you were walking through?",
      responses: [
        {
          text: "[Lower your gun first.] Nicole Mead's. I'm not here to hurt anybody.",
          action: () => {
            L.setFlag("ms_rose_lowered");
            ms.addTrust(1, "You lowered your gun first");
          },
          next: "mq07_polite",
        },
        {
          text: "[Draw on her.] Put the rifle down. Now.",
          action: () => {
            ms.addTrust(-1, "You drew on her");
          },
          next: "mq07_window",
        },
        {
          text: "Nicole Mead's. She lived here. I'm looking for her.",
          next: "mq07_who",
        },
      ],
    },
    mq07_polite: {
      text: "...Huh. Polite. [The muzzle drops an inch.] Nobody's polite on this side of First Avenue. Who are you?",
      responses: [
        {
          text: () => "My name is " + L.heroName() + ". I knew Nicole. Before.",
          next: "mq07_photo",
        },
      ],
    },
    mq07_who: {
      text: "Lots of people lived places. Who are you?",
      responses: [
        {
          text: () => "My name is " + L.heroName() + ". I knew Nicole. Before.",
          next: "mq07_photo",
        },
      ],
    },
    mq07_window: {
      text: "Bad idea, sleeper. [In one movement she is off the bed and through the open window onto the fire escape, rifle and all. Her voice comes back in from outside.] I'll be around. You'll know.",
      onEnter() {
        L.setFlag("ms_rose_met");
        ms.rose.place("home");
        L.later(0.5, () => {
          if (at("mq07", "flint")) Q.setStage("mq07", "sol");
        });
      },
      responses: [{ text: "[She's gone.]" }],
    },
    mq07_photo: {
      text: () =>
        "[You take out the photo-booth strip. She looks at it — at the woman laughing in the second frame — for a long time. Then she looks at your face. Then at the strip again. Something goes very still in her.] " +
        (L.has("ms_flint_casing") || ms.f("saw_shooter")
          ? "...You kept my brass. [She almost smiles.] Chambers Street. The robe with the lantern was watching you. I don't like them watching people. "
          : "") +
        "I knew Nicole. From the tunnels. Under Grand Central. Everybody down there knew the Candle Lady.",
      responses: [
        { text: "Is she alive?", next: "mq07_alive" },
        { text: "Who are you?", next: "mq07_flint" },
      ],
    },
    mq07_alive: {
      text: "[A beat too long.] I don't know what she is. People went down there and came up different. ...I can help you look. I know the tunnels. I know who to ask and who to shoot.",
      responses: [{ text: "Who are you?", next: "mq07_flint" }],
    },
    mq07_flint: {
      text: "Flint. Rifle, roof, sign. I keep the Court's sign lit, the Court keeps out of my business. I sleep in here sometimes because it's quiet and nobody else will. [She stands, slings the rifle.] Can I— [She stops.] Can I keep that? The strip. Just for a while. I never had a picture of her laughing.",
      responses: [
        {
          text: "[Give her the photo strip.] Keep it safe.",
          action: () => {
            ms.set("rose_has_photo");
            ms.addTrust(1, "You let her keep the photo");
            L.take("ms_note_photo_strip", 1);
          },
          next: "mq07_kept",
        },
        { text: "I need it. I'm sorry.", next: "mq07_no" },
      ],
    },
    mq07_kept: {
      text: "[She puts it in her breast pocket and buttons the pocket.] Thanks. [Quietly.] Talk to Sol, downstairs. The doorman. He's been holding something for twenty years and never told anybody what. Then come find me under the sign. Roof. Don't come up the elevator shaft; that's mine.",
      onEnter() {
        meetDone();
      },
      responses: [{ text: "I will." }],
    },
    mq07_no: {
      text: "Sure. Course you do. [She doesn't argue.] Talk to Sol, downstairs. The doorman. He's been holding something for twenty years. Then come find me under the sign, if you want help. Roof.",
      onEnter() {
        meetDone();
      },
      responses: [{ text: "I will." }],
    },
    mq08_gate: {
      speaker: () => ms.roseName(),
      text: "[Flint leans on a dead flagpole outside the UN fence, as far from the Continuity guards as the street allows.] I don't go on their ground. Not since they started counting people. Go on. If Hale asks, I was never here. She'll ask.",
      responses: [
        { text: "You know Hale?", next: "mq08_hale" },
        { text: "Wait here." },
      ],
    },
    mq08_hale: {
      text: "We grew up a block apart. Tudor Place. She lent me books. Then she put on the uniform and I put on the rifle. [A shrug.] Go hear her pitch. Don't sign anything. They love it when you sign things.",
      responses: [{ text: "Back soon." }],
    },
    mq10_steps: {
      speaker: () => ms.roseName(),
      text: "[Flint is sitting on the cathedral steps with her back to the doors, cleaning the rifle's scope with her shirt.] I don't go in there. Not since I was sixteen. [She doesn't look up.] Don't let them give you a candle. Once you're holding one they think you're theirs.",
      onEnter() {
        L.setFlag("ms_rose_mq10_steps");
      },
      responses: [
        { text: "What happened when you were sixteen?", next: "mq10_sixteen" },
        { text: "I'll be quick." },
      ],
    },
    mq10_sixteen: {
      text: "I left. [That is the whole answer.] Go on, sleeper. Five forty-seven comes around every day whether you're ready or not.",
      responses: [{ text: "I'll be quick." }],
    },
  });
  function meetDone() {
    L.setFlag("ms_rose_met");
    ms.rose.place("home");
    if (at("mq07", "flint")) Q.setStage("mq07", "sol");
  }

  // ------------------------------------------------------------------
  // mq08: Hale, Ilse, Booth Four
  // ------------------------------------------------------------------
  // Hale's guests are not shot at: a local truce at the UN (plaza + Assembly Hall) while mq08 runs.
  function unTruce() {
    L.truceZone("ms_un_mq08", {
      faction: "continuity",
      x: 313,
      z: -320,
      r: 95,
      cond: () => Q.isActive("mq08") && !L.flag("con_hostile"),
    });
    const o = IX("un_assembly");
    L.truceZone("ms_un_mq08_in", {
      faction: "continuity",
      x: o.x,
      z: o.z,
      r: 160,
      cond: () => Q.isActive("mq08") && !L.flag("con_hostile"),
    });
  }
  L.hook("init", unTruce);
  L.hook("reset", unTruce);
  ms.inject("dlg_con_hale", {
    start: () =>
      at("mq08", "hale")
        ? "mq08_offer"
        : Q.isActive("mq08") &&
            Q.reached("mq08", "ilse") &&
            !L.flag("ms_con_knows_nicole") &&
            !L.flag("ms_hale_asked")
          ? "mq08_again"
          : null,
    nodes: {
      mq08_offer: {
        speaker: "Lieutenant Hale",
        text: () =>
          "[A young officer in a pressed grey uniform, hair regulation-short, a clipboard she holds like a shield.] Lieutenant Vesper Hale, the Continuity, United Nations forward command. And you are the second sleeper. Volunteer " +
          last() +
          ", Long Winter, Cryo Unit C-9. " +
          "We've had a file open on you since the day your pod went green. Welcome back to the United States Government, Mr. " +
          last() +
          ". It has missed you.",
        responses: [
          { text: "What do you want with me?", next: "mq08_want" },
          {
            text: "You're holding my friend on Liberty Island.",
            next: "mq08_zeke",
          },
        ],
      },
      mq08_want: {
        text: "A standing offer, nothing more today. Civil Defense records clerk, Grade 4, reinstated, back pay at 1967 rates, which the Treasury will honour as soon as there is a Treasury. A bunk, ration cards, a uniform that isn't padded. In return, when the time comes, you help us light the Statue's torch. That's all. The offer stands until you take it or shoot at us. Most people take it.",
        responses: [
          { text: "Not today, Lieutenant.", next: "mq08_notyet" },
          { text: "And Zeke Marlow?", next: "mq08_zeke" },
        ],
      },
      mq08_zeke: {
        text: "Mr. Marlow is a guest of Colonel Crane on Liberty Island. Uncooperative, unharmed, very loud about water pressure. When you're ready to talk about the torch, we'll talk about Mr. Marlow. That's not a threat. It's the order of business.",
        responses: [{ text: "Not today, Lieutenant.", next: "mq08_notyet" }],
      },
      mq08_notyet: {
        text: "Understood. The offer stands. [She makes a small mark on her clipboard.] Was there something else you came for? People don't walk into the UN for the view.",
        onEnter() {
          L.setFlag("met_hale");
          if (at("mq08", "hale")) Q.setStage("mq08", "ilse");
        },
        responses: [
          {
            text: "I'm looking for someone who worked here in 1967. An interpreter.",
            next: "mq08_interp",
          },
          { text: "Just the view.", next: "mq08_view" },
        ],
      },
      mq08_interp: {
        text:
          "In 1967? [She thinks.] Then you want Mrs. Moravec. Ilse Moravec. She was here before the Bombing and she never left; we kept her on as a translator because nobody else reads Czech, French and Continuity forms. She's on the plaza most afternoons, feeding pigeons that aren't there. " +
          "[She hesitates.] And, Mr. " +
          last() +
          "? I saw who walked you to the gate. Tell Flint she still owes me a book.",
        responses: [{ text: "I'll tell her." }],
      },
      mq08_view: {
        text: "Then enjoy it. Mrs. Moravec is on the plaza if you want a guide. She remembers everything, which is a burden in this building. [A pause.] And tell Flint she still owes me a book. I saw her at the gate.",
        responses: [{ text: "I'll tell her." }],
      },
      mq08_again: {
        speaker: "Lieutenant Hale",
        text: () =>
          "Mr. " + last() + ". Back already. Have you reconsidered the offer?",
        responses: [
          {
            text: "I'm here for Nicole Mead. She was an interpreter here. I was going to marry her.",
            next: "mq08_truth",
          },
          { text: "Still thinking.", action: () => L.setFlag("ms_hale_asked") },
        ],
      },
      mq08_truth: {
        text: "[She writes nothing down. That's the first time.] Mead. Booth Four. [Very quietly.] There's a file in Records with that name on it, from 1968. I've never been cleared to open it. ...I'll ask. I shouldn't, and I will.",
        onEnter() {
          ms.set("con_knows_nicole");
          L.setFlag("con_knows_nicole");
          L.setFlag("ms_hale_asked");
          L.xp(20, "The truth, to Hale");
        },
        responses: [{ text: "Thank you, Lieutenant." }],
      },
    },
  });
  // Ilse Moravec: on the plaza (stage ilse), then at Booth Four (booth / steno).
  const ilseDef = (where) => ({
    type: "ilse_moravec",
    preset: "ilse",
    name: "Ilse Moravec",
    gender: "f",
    age: 64,
    hair: "bun",
    hairColor: 0xc9c3b8,
    outfit: "continuity_uniform",
    faction: "continuity",
    hostile: false,
    essential: true,
    ai: "guard",
    home: "here",
    homeR: 2,
    level: 3,
    dialogue: "dlg_ms_ilse",
    at: Object.assign({ maxR: 8 }, where),
  });
  ms.actor({
    id: "ms_ilse",
    when: () =>
      Q.isActive("mq08") &&
      (stage("mq08") === "hale" || stage("mq08") === "ilse"),
    def: () => ilseDef(P.unPlaza),
  });
  ms.actor({
    id: "ms_ilse_booth",
    when: () =>
      Q.isActive("mq08") &&
      (stage("mq08") === "booth" || stage("mq08") === "steno"),
    def: () => ilseDef(P.booth()),
  });
  ms.dlg("dlg_ms_ilse", "idle")
    .when(() =>
      at("mq08", "ilse")
        ? "meet"
        : at("mq08", "booth") || at("mq08", "steno")
          ? "booth"
          : null,
    )
    .add({
      idle: {
        speaker: "Ilse Moravec",
        text: "Booth Four. Go on. I will wait.",
        responses: [{ text: "All right." }],
      },
      meet: {
        speaker: "Ilse Moravec",
        text: "[A grey-haired woman in a Continuity uniform two sizes too big sits on a bench with a paper bag of crumbs and no pigeons.] You are the one from the freezer. Everybody is talking. [She looks at you over her glasses.] What do you want with an old translator, Mr. Sleeper?",
        responses: [
          { text: "Did you know Nicole Mead? Booth Four.", next: "nicole" },
        ],
      },
      nicole: {
        text: "[The bag of crumbs goes still.] Nicky. Booth Four, French into English. I had the booth beside her for three years; we shared a thermos and a dictionary and a great many opinions about the Soviet delegation. [Her eyes are wet and she ignores them.] She talked about a boy who made bad jokes about winter. Is that you? It is you. You are taller than she said.",
        responses: [
          {
            text: "What happened to her? The day of the Bombing.",
            next: "day",
          },
        ],
      },
      day: {
        text: "Not here. Not in front of the plaza. [She stands, slowly.] Come to the Assembly Hall. Booth Four. Her things are still there; nobody has used that booth since. Mind the public gallery. The Maniacs nest in the seats, and the soldiers will not help you, only watch.",
        onEnter() {
          if (at("mq08", "ilse")) Q.setStage("mq08", "booth");
        },
        responses: [{ text: "I'll meet you there." }],
      },
      booth: {
        speaker: "Ilse Moravec",
        text: () =>
          stage("mq08") === "booth"
            ? "[Ilse is already in the booth, sitting in her old chair as if it were 1967 and the session were about to start.] You found it. Sit. Not that chair. That one is hers."
            : "[Ilse taps the steno pad on the desk.] Her pad. She wrote everything down, even when we were told not to. Especially then.",
        responses: [{ text: "Tell me about that morning.", next: "morning" }],
      },
      morning: {
        text:
          "Sunday, the fifth. They called an emergency session at dawn — radar contacts over the Atlantic, coming west. Nicky was sick when she came in. She had been sick every morning that week. [A small, dry look.] I had my guess. I did not say it. " +
          "The French delegate was beside herself. At half past eight the American Civil Defense man, the liaison, stood up and took his hat and left. He did not look at anyone. Nicky wrote it down. She said he walked out like a man who knew the time.",
        onEnter() {
          if (at("mq08", "booth")) Q.setStage("mq08", "steno");
        },
        responses: [{ text: "And at 9:47?", next: "shelter" }],
      },
      shelter: {
        text:
          'At nine-forty the French delegate said, into Nicky\'s headset, "These aircraft did not leave from Paris." At nine-forty-five they sent us to the basement of the Secretariat. Two minutes later the building shook. We were fifteen kilometres from it and the lights went out and the basement filled with dust. ' +
          'She held my hand. When they let us up, in the afternoon, she said she was going to Grand Central. "Everybody will go to the station," she said. "Somebody has to keep the light on." I went home to my husband. I never saw her again.',
        responses: [{ text: "[Read the steno pad.]", next: "pad" }],
      },
      pad: {
        text: "[The pad is in shorthand. Ilse has transcribed it in the margins, years ago, in pencil, as if she had needed to read it more than once. The last line is not shorthand at all.]",
        responses: [
          {
            text: "[Take the steno pad.]",
            action: () => {
              if (!L.has("ms_note_ilse_steno")) L.give("ms_note_ilse_steno", 1);
              ms.token("booth");
            },
            next: "end",
          },
          {
            text: "[Leave it where it belongs.]",
            action: () => {
              L.setFlag("ms_steno_left");
            },
            next: "end",
          },
        ],
      },
      end: {
        text: () =>
          "Hale will tell you the Continuity is the government. The man who walked out at eight-thirty was the government too. [She smooths the empty chair.] Find her, Mr. " +
          last() +
          ". Or find out. One of those.",
        onEnter() {
          L.xp(60, "Booth Four");
          if (
            Q.isActive("mq08") &&
            (stage("mq08") === "steno" || stage("mq08") === "booth")
          )
            Q.complete("mq08");
        },
        responses: [{ text: "Thank you, Ilse." }],
      },
    });
  // Maniacs in the public gallery when Booth Four is reached.
  function spawnGalleryManiacs() {
    const b = ms.resolve(P.booth());
    if (!b) return;
    for (let i = 0; i < 3; i++) {
      const id = "ms_un_maniac_" + i;
      if (L.flag("dead_" + id)) continue;
      const a = (i / 3) * Math.PI * 2;
      L.spawnNPC({
        id,
        type: "maniac",
        name: "Maniac",
        faction: "maniacs",
        hostile: true,
        ai: "wander",
        level: 5,
        noRespawn: true,
        at: {
          fallback: {
            x: b.x + Math.cos(a) * 9,
            z: b.z + Math.sin(a) * 9,
            y: b.y,
          },
          maxR: 6,
        },
        home: { x: b.x, z: b.z, r: 14 },
      });
    }
  }
  L.trigger({
    id: "ms_booth_maniacs",
    once: false,
    cooldown: 30,
    pos: () => ms.resolve(P.booth()),
    r: 40,
    cond: () =>
      at("mq08", "booth") && L.inInterior() && !L.flag("ms_maniacs_spawned"),
    fire() {
      L.setFlag("ms_maniacs_spawned");
      spawnGalleryManiacs();
    },
  });
  L.trigger({
    id: "ms_booth_reach",
    once: false,
    cooldown: 2,
    pos: () => ms.resolve(P.booth()),
    r: 5,
    cond: () => at("mq08", "booth") && L.inInterior(),
    fire() {
      L.notify(
        "Booth Four. Two chairs, two headsets on a hook, a thermos with a cracked cork. On the desk, a steno pad.",
        { duration: 6 },
      );
    },
  });

  // ------------------------------------------------------------------
  // mq09: Grand Central old-timers
  // ------------------------------------------------------------------
  const OLD = ["gc_doc", "ms_mort", "gc_moe"];
  function oldtimers() {
    return OLD.filter((id) => L.flag("ms_ot_" + id)).length;
  }
  function askedOldTimer(id) {
    if (L.flag("ms_ot_" + id)) return;
    L.setFlag("ms_ot_" + id);
    if (at("mq09", "oldtimers")) {
      if (oldtimers() >= 2) Q.setStage("mq09", "grate");
      else L.refresh("mq09");
    }
  }
  ms.actor({
    id: "ms_mort",
    when: () => Q.isStarted("mq07") || Q.isStarted("mq09"),
    def: {
      type: "human",
      name: "Mort Feldstein",
      gender: "m",
      age: 72,
      hair: "balding",
      hairColor: 0xc9c3b8,
      outfit: "settler",
      glasses: true,
      faction: "settlers",
      hostile: false,
      essential: true,
      ai: "sit",
      home: "here",
      level: 3,
      dialogue: "dlg_ms_mort",
      at: Object.assign({ maxR: 8 }, P.gcMort),
      barks: [
        "Shine? No? Nobody shines anymore.",
        "Fifty-nine I started this stand. Fifty-nine!",
      ],
    },
  });
  ms.dlg("dlg_ms_mort", "idle")
    .when(() =>
      Q.isActive("mq09") &&
      !L.flag("ms_ot_ms_mort") &&
      Q.reached("mq09", "oldtimers")
        ? "mq09"
        : null,
    )
    .add({
      idle: {
        speaker: "Mort Feldstein",
        text: "Mort Feldstein. Shoe shine, since 1959. I had a stand by the Vanderbilt ramp. Now I have a box. The box is a stand if you squint.",
        responses: [{ text: "Take care, Mort." }],
      },
      mq09: {
        speaker: "Mort Feldstein",
        text:
          "The lower level? [He puts down his rag.] I lived down there a year. Everybody did, the first winter. The Sixty-One Camp, we called it, after the old private siding nobody was supposed to know about. It was warm-ish, and it was dark, and there was a lady with candles. " +
          'The Candle Lady. Every kid got one. "For the people who are sleeping," she said. I asked her who was sleeping and she said "everybody I love."',
        responses: [{ text: "What happened to the Camp?", next: "riot" }],
      },
      riot: {
        text: "The OCD set up a Relief Station on the concourse, winter of '68. Penicillin, rations — if you had a card. The fifth of March, the anniversary, there was a riot. Fire. They say it started with one match. [He looks at the floor.] After, they bricked up the stair and wired a grate on it. Nobody's been down since. Nobody wants to.",
        onEnter() {
          askedOldTimer("ms_mort");
        },
        responses: [{ text: "Thank you, Mort." }],
      },
    });
  ms.inject("dlg_gc_delphine", {
    start: () => (at("mq09", "delphine") ? "mq09_lower" : null),
    nodes: {
      mq09_lower: {
        speaker: "Stationmaster Okafor",
        text: "The lower level. [Delphine stops walking, which she never does.] Who's been talking? ...Fine. I was eight. My mother and I came down the Vanderbilt stairs the afternoon of the Bombing with four thousand other people, and we stayed a year, down on the deep platforms by the old Track 61 siding. The Sixty-One Camp.",
        responses: [
          {
            text: "Was there a woman down there called Nicole? Nicky?",
            next: "mq09_lady",
          },
        ],
      },
      mq09_lady: {
        text: "We didn't use names much. There was the Candle Lady. She had a box of candles from God knows where and she gave every child one. \"For the people who are sleeping.\" She taught us to sing in the dark so we wouldn't be scared. [A pause.] She had a baby, that winter. I used to mind it. Rock it while she worked. I was eight. I thought it was the most important job in the world.",
        responses: [{ text: "What happened to them?", next: "mq09_after" }],
      },
      mq09_after: {
        text: "There was a riot in '68, on the anniversary, and a fire, and they sealed the stair. After that I don't know. I know what people say. [She looks at you, then away.] Ask the other old-timers. Doc Hollis was down there, he was a student then. Mort, at the shoeshine. Moe ran a soup kettle. And look through the grate, if you have to. I never do.",
        onEnter() {
          if (at("mq09", "delphine")) Q.setStage("mq09", "oldtimers");
        },
        responses: [{ text: "Thank you, Delphine." }],
      },
    },
  });
  ms.inject("dlg_gc_doc", {
    start: () =>
      Q.isActive("mq09") &&
      Q.reached("mq09", "oldtimers") &&
      (!L.flag("ms_ot_gc_doc") || !L.flag("ms_hollis_named"))
        ? "mq09_doc"
        : null,
    nodes: {
      mq09_doc: {
        speaker: "Doc Hollis",
        text: () =>
          L.flag("ms_ot_gc_doc")
            ? "Still on about the Camp? I told you what I saw."
            : "1967. [He takes his glasses off.] I was a third-year at Bellevue when the bombers came. Down there I was the closest thing to a doctor for four thousand people. I delivered nine babies on those platforms. " +
              "One of them I remember. November, a girl, at dawn. On the tracks by the old siding, on a pile of mailbags. The mother laughed the whole time. Laughed. I'd never seen anything like it.",
        onEnter() {
          askedOldTimer("gc_doc");
        },
        responses: [
          {
            text: "[Medicine 30] Breech? Long labour? You'd remember her name, Doc — you'd have written it on the chart.",
            check: { skill: "medicine", value: 30 },
            next: "mq09_name",
            failNext: "mq09_noname",
            cond: () => !L.flag("ms_hollis_named"),
          },
          {
            text: "[Presence 5] Please. Her name.",
            check: { attr: "presence", value: 5 },
            next: "mq09_name",
            failNext: "mq09_noname",
            cond: () => !L.flag("ms_hollis_named"),
          },
          { text: "Thank you, Doc." },
        ],
      },
      mq09_name: {
        text: 'Chart. [A short laugh.] I wrote it on my cuff. ...Nicky. The mother was called Nicky. She made me write the time, too: "at dawn," she said, "write at dawn," like it mattered. [He puts his glasses back on.] It did, I suppose.',
        onEnter() {
          ms.set("hollis_named");
          L.setFlag("ms_hollis_named");
          L.xp(25, "Doc Hollis remembers");
        },
        responses: [{ text: "Thank you, Doc." }],
      },
      mq09_noname: {
        text: "Names. Twenty-two years and four thousand people. I remember the laughing.",
        responses: [{ text: "Thank you, Doc." }],
      },
    },
  });
  ms.inject("dlg_gc_moe", {
    start: () =>
      Q.isActive("mq09") &&
      Q.reached("mq09", "oldtimers") &&
      !L.flag("ms_ot_gc_moe")
        ? "mq09_moe"
        : null,
    nodes: {
      mq09_moe: {
        speaker: "Moe Kessler",
        text:
          "The Candle Lady? [Moe reaches under the bar and puts down a candle stub, yellow with age, wrapped in a bar napkin.] Everybody down there had one of hers. I ran a soup kettle by the siding and she'd come by every night, light one off the burner, and walk off with it into the dark to hand out more. " +
          'She talked funny, French-funny. Called everybody "chéri." Called me "chéri." Nobody called me that before or since.',
        onEnter() {
          askedOldTimer("gc_moe");
        },
        responses: [{ text: "You kept the candle.", next: "mq09_kept" }],
      },
      mq09_kept: {
        text: "Never lit it. Felt like somebody else's to light. [He puts it away again.] Whatever you're looking for, pal, I hope it's still there.",
        responses: [{ text: "Thanks, Moe." }],
      },
    },
  });
  ms.inject("dlg_bs_lys", {
    start: () =>
      Q.isActive("mq09") && !L.flag("ms_lys_met") ? "mq09_lys" : null,
    nodes: {
      mq09_lys: {
        speaker: "Mademoiselle Lys",
        text: "[A woman in a good coat, out of place and comfortable with it, sits at the Whistle Stop with a typewriter and a sign: LETTERS WRITTEN, ANY LANGUAGE.] Sit down, monsieur. You are looking at me as if you know my face. It is the other way round. I know yours. From a photograph.",
        responses: [
          { text: "What photograph?", next: "mq09_lys2" },
          { text: "Another time." },
        ],
      },
      mq09_lys2: {
        text: "Another time, as you say. [She rolls a fresh sheet into the typewriter.] I write letters for people who cannot. If you ever want to write one to someone who will not answer, I am here every day. That is the whole business of this station, you know. Letters to people who will not answer.",
        onEnter() {
          ms.set("lys_met");
          L.setFlag("ms_lys_met");
        },
        responses: [{ text: "I'll remember." }],
      },
    },
  });
  ms.spot({
    id: "ms_spot_grate",
    label: "Sealed stair (grate)",
    verb: "Look through",
    when: () => Q.isStarted("mq09"),
    at: P.gcStair,
    use() {
      if (!L.has("ms_note_gc_grate")) L.give("ms_note_gc_grate", 1);
      L.notify(
        "Through the grate: a wall of melted candles at the first landing, years deep, and above it a sun with twelve rays in chalk. The chalk is fresh. A notice is wired to the bars: LOWER LEVEL CLOSED BY ORDER OF THE OCD. RELIEF STATION RIOT, 5 MARCH 1968.",
        { duration: 9 },
      );
      L.setFlag("ms_grate_seen");
      if (at("mq09", "grate")) {
        L.xp(30, "The sealed stair");
        Q.complete("mq09");
      }
    },
  });
  ms.spot({
    id: "ms_spot_gallery_act1",
    label: "Whispering Gallery corner",
    verb: "Stand in the corner",
    when: () => Q.isStarted("mq02") && !L.flag("ms_gallery_memory"),
    at: P.gcGallery,
    use() {
      L.ms.galleryMemory && L.ms.galleryMemory();
    },
  });

  // ------------------------------------------------------------------
  // mq10: the reply, the cathedral, the Dawn Hour
  // ------------------------------------------------------------------
  ms.inject("dlg_rc_rocky", {
    start: () =>
      at("mq10", "reply")
        ? "mq10_reply"
        : at("mq10", "compare")
          ? "mq10_compare"
          : null,
    nodes: {
      mq10_reply: {
        speaker: '"Rocky" Delgado',
        text: 'Popsicle! You got mail. Somebody slid this under the stage door at five in the morning, and Rockette-7 says the somebody was wearing a bedsheet. [He holds up an envelope by one corner, like it might go off.] It\'s addressed "For the sleeper, c/o Radio Free Manhattan." Smells like a church.',
        responses: [
          {
            text: "[Take the envelope.]",
            action: () => {
              if (!L.has("ms_note_dawn_reply")) L.give("ms_note_dawn_reply", 1);
              if (at("mq10", "reply")) Q.setStage("mq10", "compare");
            },
            next: "mq10_compare",
          },
        ],
      },
      mq10_compare: {
        speaker: '"Rocky" Delgado',
        text: "Well? Open it. I'm dying here. I'm a professional and I'm dying.",
        responses: [
          {
            text: "[Hold the seal next to Nicole's letters.]",
            next: "mq10_match",
          },
        ],
      },
      mq10_match: {
        text:
          "[Three words inside: Stop looking. She is in the Light. You lay the wax seal beside the signature on Nicole's letters. The same sun. Twelve rays. The same short ray at four o'clock where her pen always skipped. Somebody carved her doodle into a stamp.] " +
          "...Pal, you're white as a sheet. Who's \"she\"? ...That sun. That's the Glowkeepers' sun. The cathedral crowd, St. Patrick's, Fifth Avenue. Every morning at five forty-seven their pirate show steps on my signal, a lady reading scripture. The Dawn Hour.",
        onEnter() {
          L.setFlag("ms_seal_matched");
          if (at("mq10", "compare")) Q.setStage("mq10", "cathedral");
        },
        responses: [
          { text: "Then I'm going to the cathedral.", next: "mq10_go" },
        ],
      },
      mq10_go: {
        text: "Then go careful. They're nice. That's what bothers me. ...And Popsicle? Flint's been hanging around the lobby all morning pretending she's not waiting for you. She's waiting for you.",
        responses: [{ text: "Thanks, Rocky." }],
      },
    },
  });
  ms.inject("dlg_glow_ezra", {
    start: () =>
      at("mq10", "keeper") || at("mq10", "cathedral") ? "mq10_keeper" : null,
    nodes: {
      mq10_keeper: {
        speaker: "Keeper Ezra Hollowell",
        text: "[A tall, stooped man in grey robes, a sun disc on his chest, a voice built for a bigger room.] The sleeper. Welcome to the Cathedral of the Second Sun. We have been told to expect you, and here you are, which is the nicest kind of prophecy. What do you seek in the Light?",
        onEnter() {
          if (at("mq10", "cathedral")) Q.setStage("mq10", "keeper");
        },
        responses: [
          {
            text: "[Show him the reply.] Someone in your church sent me this. With her seal.",
            next: "mq10_seal",
          },
        ],
      },
      mq10_seal: {
        text: "[He looks at the seal and something passes over his face and is gone.] We do not keep the old names, friend. When we come into the Light, the name we had goes under a stone, and we take a new one. Whoever you are looking for is not here. Not under that name.",
        responses: [
          {
            text: "[Persuasion 40] Then tell me who wrote it.",
            check: { skill: "persuasion", value: 40 },
            next: "mq10_dawn",
            failNext: "mq10_nodawn",
            cond: () => !L.flag("ms_dawn_wrote_letter"),
          },
          {
            text: "[Threaten him.] You'll tell me where she is, Keeper, or I'll take this church apart.",
            next: "mq10_threat",
          },
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_dawn: {
        text: "[A long breath.] The Dawn herself. She leads us. She does not come up into the daylight, and she does not write to anyone. She wrote to you. [He hands the letter back very carefully.] I do not know why. I would like to.",
        onEnter() {
          ms.set("dawn_wrote_letter");
          L.setFlag("ms_dawn_wrote_letter");
          L.xp(30, "Persuasion: the Dawn");
        },
        responses: [
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_nodawn: {
        text: "Words come from the Light, friend. The Light uses many hands. [He smiles. It does not reach his eyes.]",
        responses: [
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_threat: {
        text: "[The acolytes along the nave stand up, all at once.] We have been threatened by better-armed men than you, sleeper, and by the sky itself. [Quietly.] We will remember that you asked this way.",
        onEnter() {
          ms.set("glow_wary");
          L.setFlag("ms_glow_wary");
          L.standing(-15, "Threatened the Keeper");
        },
        responses: [
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_service: {
        text: "Serve the Light, and the Light may turn its face toward you. I have a small service in mind — a blessing, for the water of Grand Central. When the time comes, I will ask it of you. Speak to Sister Noonday. She will give you the Dawn's words to read until then.",
        responses: [
          {
            text: "I'll do your service.",
            action: () => {
              ms.set("glow_service");
              L.setFlag("ms_glow_service");
            },
            next: "mq10_noon",
          },
          { text: "We'll see.", next: "mq10_noon" },
        ],
      },
      mq10_noon: {
        text: "Go in the Light, sleeper. A dimanche.",
        onEnter() {
          if (at("mq10", "keeper")) Q.setStage("mq10", "dawnhour");
        },
        responses: [{ text: "[A dimanche. She used to say that.]" }],
      },
    },
  });
  ms.inject("dlg_glow_sister", {
    start: () =>
      Q.isActive("mq10") &&
      Q.reached("mq10", "keeper") &&
      !L.has("ms_note_dawn_hour_1")
        ? "mq10_noonday"
        : null,
    nodes: {
      mq10_noonday: {
        speaker: "Sister Noonday",
        text: "[A round-faced woman with flour on her robes and a candle burning in a jar at her elbow.] You want the Dawn's words? We print them. Every morning, five forty-seven, she speaks, and by noon we have it on paper for the ones who sleep through. Here — last Sunday's. It's a good one. It's about keeping.",
        onEnter() {
          if (!L.has("ms_note_dawn_hour_1")) L.give("ms_note_dawn_hour_1", 1);
        },
        responses: [{ text: "Thank you, Sister." }],
      },
    },
  });
  // The Dawn Hour itself: tune in any morning at 05:47 (game time) while the stage is open.
  function dawnHourHeard(how) {
    if (!at("mq10", "dawnhour")) return;
    L.setFlag("ms_dawn_hour_heard", how);
    L.xp(40, "The Dawn Hour");
    Q.complete("mq10");
  }
  let dhT = 0;
  L.hook("update", function (dt, realDt) {
    dhT -= realDt;
    if (dhT > 0) return;
    dhT = 1;
    if (!at("mq10", "dawnhour") || L.flag("ms_dh_playing")) return;
    const h = G.time && G.time.hour;
    if (typeof h !== "number") return;
    if (h >= 5.7 && h < 6.6) {
      L.setFlag("ms_dh_playing");
      const t = ms.scene(
        [
          [
            "THE DAWN HOUR (pirate, 05:47)",
            "Good morning, children. It is five forty-seven, and the Sun has been patient with us for one more night.",
          ],
          [
            "THE DAWN HOUR",
            "Every one of you keeps something. A name. A photograph. A key you cannot use. The keeping is not a weight. It is a light.",
          ],
          ["THE DAWN HOUR", "Somebody has to keep the light on."],
          [
            "THE DAWN HOUR",
            "The sleepers sleep. We do not wake them. We keep the light on, and we wait. A dimanche, children.",
          ],
        ],
        5.2,
      );
      L.later(t + 1, () => {
        L.notify(
          "The signal drops back to static. Her voice was low and careful, like someone speaking a second language perfectly.",
          { duration: 6 },
        );
        dawnHourHeard("radio");
        L.setFlag("ms_dh_playing", false);
      });
    }
  });

  // ------------------------------------------------------------------
  // The Chambers Street spots need positions: patch them in once the layout is known.
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const X = cryoOut();
    const w = { x: X.x - 4, z: X.z - 34 },
      f = { x: X.x + 12, z: X.z - 8 };
    const fw = L.freeSpot(w.x, w.z, undefined, { maxR: 10 }),
      ff = L.freeSpot(f.x, f.z, undefined, { maxR: 10 });
    spotAt.ms_spot_watcher = fw;
    spotAt.ms_spot_shooter = ff;
  });

  // ------------------------------------------------------------------
  // Test solvers (forced stage walk)
  // ------------------------------------------------------------------
  ms.solver("mq01", {
    "*"() {
      G.events.emit("cheatSkipStart");
    },
  });
  ms.solver("mq02", {
    travel() {
      Q.setStage("mq02", "gallery");
    },
    gallery() {
      if (L.ms.galleryMemory) L.ms.galleryMemory();
      Q.setStage("mq02", "ask");
    },
    ask() {
      L.give("q_reel_zeke_travel", 1, true);
      Q.complete("mq02");
    },
  });
  ms.solver("mq03", {
    rocky() {
      Q.setStage("mq03", "amp");
    },
    amp() {
      L.give("q_signal_amplifier", 1, true);
      if (Q.stage("mq03") === "amp") Q.setStage("mq03", "deliver");
    },
    deliver() {
      L.take("q_signal_amplifier", 1);
      L.setFlag("amp_delivered");
      Q.setStage("mq03", "notice");
    },
    notice() {
      L.setFlag("ms_notice", "sundays");
      Q.setStage("mq03", "listen");
    },
    listen() {
      L.give("q_reel_intercept", 1, true);
      Q.complete("mq03");
    },
  });
  ms.solver("mq07", {
    court() {
      passCourt("knelt");
    },
    apt() {
      L.give("ms_note_9c_calendar", 1);
      L.give("ms_record_two_bits", 1);
      if (at("mq07", "apt")) Q.setStage("mq07", "flint");
    },
    flint() {
      L.setFlag("ms_rose_lowered");
      ms.addTrust(1, "test");
      meetDone();
    },
    sol() {
      L.give("ms_note_nicole_1968", 1);
      L.setFlag("ms_sol_letter_given");
      Q.setStage("mq07", "letter");
    },
    letter() {
      readLetter();
    },
  });
  ms.solver("mq08", {
    hale() {
      L.setFlag("met_hale");
      Q.setStage("mq08", "ilse");
    },
    ilse() {
      Q.setStage("mq08", "booth");
    },
    booth() {
      Q.setStage("mq08", "steno");
    },
    steno() {
      L.give("ms_note_ilse_steno", 1);
      ms.token("booth");
      Q.complete("mq08");
    },
  });
  ms.solver("mq09", {
    delphine() {
      Q.setStage("mq09", "oldtimers");
    },
    oldtimers() {
      askedOldTimer("gc_doc");
      askedOldTimer("ms_mort");
    },
    grate() {
      L.give("ms_note_gc_grate", 1);
      L.setFlag("ms_grate_seen");
      Q.complete("mq09");
    },
  });
  ms.solver("mq10", {
    reply() {
      L.give("ms_note_dawn_reply", 1);
      if (at("mq10", "reply")) Q.setStage("mq10", "compare");
    },
    compare() {
      L.setFlag("ms_seal_matched");
      Q.setStage("mq10", "cathedral");
    },
    cathedral() {
      Q.setStage("mq10", "keeper");
    },
    keeper() {
      ms.set("glow_service");
      Q.setStage("mq10", "dawnhour");
    },
    dawnhour() {
      L.give("ms_note_dawn_hour_1", 1);
      dawnHourHeard("transcript");
    },
  });
})();
