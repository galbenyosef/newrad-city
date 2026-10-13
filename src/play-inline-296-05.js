// play-inline-296 05 — title
// Lines 2384-2472 of readable/play-inline-296.pretty.js (statement-aligned).
  PM.item({
    id: "pm2_nocturne",
    type: "misc",
    quest: true,
    name: 'Painting: "Nocturne for a Dying City"',
    weight: 4,
    value: 400,
    desc: 'Aldous Penrose, oil on canvas, 1966. A swirling night over the skyline and a green moon that is not a moon. On the back, in crayon: "GOOD. MAKE CRITIC SAD. 5 STARS."',
  });
  PM.item({
    id: "pm2_critics_beret",
    type: "apparel",
    slot: "head",
    name: "The Critic's Beret",
    weight: 0.5,
    value: 180,
    dr: 1,
    attrs: { senses: 1, presence: -1 },
    skills: { persuasion: 10 },
    desc: "A black felt beret stretched over a Brute's skull for years. Wearing it makes you notice everything and like none of it. +1 Senses, −1 Presence, +10 Persuasion.",
  });
  PM.item({
    id: "pm2_moma_key",
    type: "key",
    name: "MoMA Registrar's Key",
    weight: 0,
    value: 0,
    desc: 'A brass key on a lanyard marked "REGISTRAR — COLLECTION STORAGE". The Critic wore it as an earring.',
  });
  PM.item({
    id: "pm2_note_guard",
    type: "note",
    name: "Security Log, Mar. 5",
    title: "MoMA Security — Night Log",
    text: 'MAR 4 — 23:10. Loading dock. Six crates signed out to "Civil Defense, Central Park". Paperwork says LOAN. Driver says "safekeeping". Nobody asked the curators.\n\nMAR 5 — 09:42. Sirens. Visitors sent to the garden, then back inside, then to the garden again. Nobody knows which is safer.\n\n09:47. The sky went white over the Bronx. I have locked Storage. The key is with the registrar. The registrar is on the third floor.\n\n09:49. Tell my wife I finished the crossword. I didn\'t, but tell her anyway.',
  });
  PM.item({
    id: "pm2_note_review",
    type: "note",
    name: 'Brute Scrawl: "REVIEW"',
    title: "REVIEW BY CRITIC (ON BACK OF MUSEUM MAP)",
    text: "HUMAN ART.\n\nSQUARE ONES: TOO SQUARE. 1 STAR.\nDRIPPY ONE: CRITIC ALSO DRIP. RELATE. 3 STARS.\nFLOWER POND ONE: CRITIC HIT IT. NOW BETTER. 4 STARS.\nNIGHT CITY ONE: MAKE CRITIC FEEL... SOMETHING. CRITIC NOT LIKE FEEL. PUT IN STORAGE. 5 STARS.\n\nSOFT ONES WHO VISIT: VERY SQUISHY. MAKE GOOD SCULPTURE.\n\nCRITIC IS BEST CRITIC. OTHER CRITICS ARE FOOD.",
  });
  PM.item({
    id: "pm2_reel_audio",
    type: "tape",
    name: "Tape reel: MoMA Audio Guide, Stop 12",
    title: 'Audio Guide — Stop 12: "Nocturne for a Dying City"',
    text: '[A warm, practised voice.]\n\nStop twelve. Aldous Penrose painted this in the summer of 1966 from the roof of a hotel on 44th Street. Look at the moon. Now look again. Penrose said he wanted to paint the city "the way it will be remembered, by whoever is left to remember it."\n\nCritics called it alarmist. The museum bought it anyway.\n\n[Pause.]\n\nIf you are hearing this during an air-raid drill, please proceed calmly to the Sculpture Garden. Please do not touch the sculptures on your way. Stop thirteen is the gift shop.\n\n[A second voice, close to the microphone, after the tape was meant to end:] Curators — the teletype word this season is NOCTURNE. Do not put it on a label. — Registrar',
    learn: "pm2_term_moma_curator",
  });

  PM.terminal("pm2_term_moma_curator", {
    title: "MoMA CURATORIAL NETWORK",
    header: "Department of Painting & Sculpture — Chief Curator",
    lock: PM.LOCKS.moma_term,
    entries: [
      {
        title: "Registrar's Safe",
        learn: "pm2_moma_safe",
        text: "Registrar's safe, Collection Storage: 1-9-2-9 (the year we opened). Petty cash and the Popular Circuits loan copy.",
      },
      {
        title: "Acquisitions — FY1967",
        text: 'APPROVED: Penrose, Aldous. "Nocturne for a Dying City" (1966). Oil on canvas.\n\nNote from the board: "Too gloomy for the lobby." Note from me: "That is the point." Hung in Painting & Sculpture II, west wall.\n\nUPDATE MAR 2: Moved to Collection Storage for surface cleaning. Someone keeps leaving green fingerprints on the frame.',
      },
      {
        title: 'Memo: Civil Defense "loan"',
        text: 'To: Director\nRe: The Civil Defense archive loan\n\nSix of our finest works are going into a hole under Central Park so that, and I quote the Civil Defense representative, "the future has something to look at." I asked which future. He smiled at me for a very long time.\n\nI have hidden the Penrose in Storage. They are not having the Penrose.',
      },
      {
        title: "Facilities: freight elevator",
        text: "The freight elevator runs between the Loading Dock (1) and Collection Storage (3). Art handlers only. It is also, since the sirens, the only way to the garden that the Big Ones do not guard.",
      },
      {
        title: "Release Collection Storage door",
        text: "Magnetic lock on Collection Storage: RELEASED.\n\nWARNING: climate control offline since 03/05/1967. Canvases may be brittle.",
        action() {
          PM.setFlag("moma_storage_code", true);
          PM.unlockDoor("pm2_moma_storage");
          G.notify("Collection Storage door unlocked.");
        },
      },
    ],
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
