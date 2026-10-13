// play-inline-285 03 — the
// Lines 262-461 of readable/play-inline-285.pretty.js (statement-aligned).
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "note",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["note"],
          },
          extra || {},
        ),
      );
    const tape = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );
    // ---- quest items ----
    d({
      id: "pt_prompt_book",
      type: "misc",
      name: "The Lyceum Prompt Book",
      weight: 1,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["quest"],
      mesh: "book",
      desc: 'A fat three-ring binder: every line, cue and blocking note of "Our Glowing Town", in four colours of ink and one of something darker. The raiders used pages 40 to 55 to start a fire. Pages 40 to 55 were, according to the margin, "mostly the Stage Manager going on again".',
    });
    d({
      id: "pt_es_klieg",
      type: "misc",
      name: "Studio 50 Klieg Light",
      weight: 6,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["quest"],
      mesh: "lamp",
      desc: "A heavy carbon-arc studio spotlight, CBS inventory tag still riveted to the barrel. The lens is intact. Somebody wrapped it in a Civil Defense banner for safekeeping twenty-two years ago and never came back for it.",
    });
    d({
      id: "pt_es_master_reel",
      type: "misc",
      name: 'Master Reel: "The Tomorrow Hour" 03/05/67',
      weight: 2,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["quest"],
      mesh: "tape",
      desc: 'Two-inch quadruplex videotape in a dented aluminium can. The label, in grease pencil: "FINAL — DO NOT ERASE — AIRS 8 PM SUN". It never did.',
    });
    d({
      id: "pt_key_locker417",
      type: "key",
      name: "Coin Locker Key #417",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["key"],
      mesh: "key",
      desc: 'A flat brass key on an orange plastic tag stamped PORT AUTHORITY 417. Found in the Lost & Found drawer, in an envelope marked "HOLD FOR OWNER".',
    });
    // ---- unique apparel rewards ----
    d({
      id: "pt_players_mask",
      type: "apparel",
      slot: "eyes",
      name: "Lyceum Players' Comedy Mask",
      weight: 0.5,
      value: 180,
      attrs: { presence: 1 },
      skills: { persuasion: 10 },
      tags: ["apparel", "unique"],
      mesh: "glasses",
      desc: "A gilded papier-mâché comedy mask, grinning. Barnaby swears it was worn on this stage by a man who once made a president laugh until he fell off his chair. The president, not the man.",
    });
    d({
      id: "pt_host_tux",
      type: "apparel",
      slot: "body",
      name: "Tomorrow Hour Host's Tuxedo",
      weight: 2,
      value: 220,
      dr: 3,
      attrs: { presence: 1 },
      skills: { persuasion: 10, trade: 5 },
      outfit: "merchant",
      tags: ["apparel", "clothing", "unique"],
      mesh: "cloth_black",
      desc: 'Midnight-blue dinner jacket with Civil Defense gear cufflinks and a lapel pin that reads "ASK ME ABOUT YOUR FAMILY SHELTER". The inside pocket still holds a cue card: "SMILE — THEY CAN SEE YOU".',
    });
    d({
      id: "pt_commuter_fedora",
      type: "apparel",
      slot: "head",
      name: "Commuter's Fedora",
      weight: 1,
      value: 90,
      attrs: { senses: 1 },
      skills: { stealth: 5 },
      tags: ["apparel", "hat", "unique"],
      mesh: "hat_fedora",
      desc: "A grey felt fedora with a bus transfer tucked in the band: 8:40 TO PITTSBURGH, GATE 206. Its owner meant to come back for it after work.",
    });
    // ---- notes & tape reels (Ed Sullivan) ----
    note(
      "pt_note_es_fanletter",
      "Fan Letter to Jolly Jack",
      "Found on the star dressing table",
      'Dear Mr. Johnson,\n\nI watch THE TOMORROW HOUR every Sunday with my mother and my aunt Ruth and our Valet, Clarence. When you sing "Shelter Sweet Shelter" Clarence spins his arms. We think he likes you.\n\nMy mother says that when the bombs come we will go to the shelter like you say. My aunt Ruth says the bombs are not coming and you are just selling shelters. Please write back and say who is right.\n\nYour biggest fan,\nDorothy (age 9)\nBayonne, N.J.\n\n[Pinned underneath, in a different hand: "Jack — answer the kid. — Sid"]',
    );
    tape(
      "pt_reel_es_stagemgr",
      "Tape reel: Stage Manager's Log",
      "Sid Mancuso, Studio 50 — Sun. Mar. 5, 1967",
      "\"Log, the fifth, 9:15 AM, dress rehearsal. The network's pulling us. Civil defence has the airwaves. Mr. Showtime won't accept it. He keeps saying 'The show must go on' in that voice — the Civil Defense people gave him the pitch-bend chip, God help us.\n\n9:30. Power's dropping. I've shut down the transmitter in the basement so the civil defence boys don't accuse us of jamming them. The master reel of tonight's show is locked in Mr. Fairbanks's safe upstairs. If anybody ever finds this — the power switch is the big red one on the transmitter console, and the reel goes in machine two in the control room. Somebody should see it. Jack was good this morning.\n\n9:44. The Patrolmen are locking the doors. 'Nobody leaves during a live broadcast.' Showtime's orders. I'm going out through the trap room. If I—\"\n[Sirens. Tape ends.]",
    );
    // ---- Lyceum ----
    note(
      "pt_note_ly_critic",
      "A Review, Unfinished",
      "Found in the stage-left box",
      "THE RUINS HERALD — THEATER\n\"OUR GLOWING TOWN\" at the LYCEUM (preview)\n\nOne does not expect, crossing Eighth Avenue under raider fire, to be moved. One expects, at most, to be robbed. And yet the Lyceum Players — the original company, twenty-two years on, and several of them older than the building's last coat of paint — have mounted a play of such startling tenderness that this critic forgot, for three whole acts, that his left arm had been chewed.\n\nMiss Laurent, as Emily, is luminous. She is also forty-five, playing seventeen, and one believes every word. Mr. Thistlewood's Stage Manager is\n\n[The review ends. The critic is still in his seat. He appears to have enjoyed the show to the very end.]",
    );
    tape(
      "pt_reel_ly_ghostlight",
      "Tape reel: The Ghost Light",
      "Recorded on the Lyceum fly gallery",
      "\"This is Barnaby Thistlewood, and it is — I've stopped counting, I'm afraid — some years after. There's a tradition in the theater. When the house is dark, you leave one bare bulb burning on the stage. The ghost light. Some say it's so nobody falls into the pit. Some say it's for the ghosts, so they can do their plays at night.\n\nWhen the bombs fell we were in tech rehearsal. Nineteen of us stayed in the building. Four of us didn't see the spring. The rest of us kept rehearsing. And every night someone checks the ghost light.\n\nIt hasn't gone out once. Not in twenty-two years. I think that's the whole point of theatre, really. Someone keeps the light on, and eventually someone else comes in out of the dark to see what it's for. Oh — and if anyone finds this: the director's strongbox is one-nine-oh-three. The year we opened. Of course it is.\"",
      { learn: "pt_ly_strongbox" },
    );
    tape(
      "pt_reel_ly_opening",
      "Tape reel: Opening Night Speech",
      "Barnaby Thistlewood, Mar. 5, 1967 (rehearsal)",
      '"—no, from the top. Ahem. Ladies and gentlemen, welcome to the Lyceum, the oldest continuously operating legitimate theatre on Broadway, where tonight— [a distant siren] —where TONIGHT, despite everything in the newspapers— [a much louder siren] ...Genevieve, dear, is that part of the sound design? ...Genevieve?"',
    );
    // ---- Port Authority ----
    note(
      "pt_note_pa_newspaper",
      "The First Journal, Mar. 4, 1967",
      "Late City Edition",
      'THE FIRST JOURNAL — LATE CITY — 5¢\n"You heard it here first."\n\nCOMMUTERS SNARL AT PORT AUTHORITY AS CITY "PREPARES"\nMayor Urges Calm: "Take the Bus Like Normal People"\n\nLines stretched down Eighth Avenue this afternoon as thousands sought seats on westbound coaches. A Silver Arrow dispatcher, who declined to give his name, reported selling "every ticket to Pittsburgh in the building, and some to places that aren\'t on the map." Gate 206 departed 40 minutes late.\n\nALSO INSIDE: Civil Defense "Tomorrow Hour" may be pre-empted Sunday — Lyceum opens Sunday night "on schedule" — Brooklyn Sugar Works cereal recall "not related to anything".',
    );
    note(
      "pt_note_pa_claimcheck",
      "Claim Check #417",
      "A damp slip of card",
      "PORT AUTHORITY BUS TERMINAL — COIN LOCKERS\nCLAIM CHECK  No. 417\nDeposited: 03/05/67  7:58 AM\nValid 24 HOURS. After 24 hours contents removed to LOST & FOUND, BAGGAGE LEVEL.\n\n[On the back, in pencil:] Marge — suitcase is in 417. Key's at Lost & Found if I miss the 8:40. Don't wait for me. Get on the bus. — H.",
    );
    tape(
      "pt_reel_pa_porter",
      "Tape reel: Porter's Dictation",
      "Baggage room recorder, Mar. 5, 1967",
      "\"Baggage level, Walter Grimes, porter, dictating for the incident book. Sunday, nine-thirty-five. Crowd upstairs is something terrible. Folks leaving whole trunks on the carousel and running for the gates.\n\nA gentleman came down about eight — hat, raincoat, sad eyes — asked me to hold his locker key in the Lost & Found for his wife, Margaret. I put it in an envelope. HOLD FOR OWNER. She never came.\n\nNine-forty-seven. The lights just went white. Everything went white. I'm going to sit with the bags for a while. Somebody ought to. If the dispatcher upstairs wants me, his teletype password's GATE206, same as the sign over his door.\"",
      { learn: "pt_pa_dispatch" },
    );
    tape(
      "pt_reel_pa_final_bus",
      "Tape reel: Gate 206",
      "Found in locker 417",
      "\"Marge. If you're hearing this you got the suitcase. There's money in the lining and my good hat — you always said it made me look like a detective. I'm going to try for the 8:40. If I don't make it... take the bus. Go west. Find somewhere with a porch. I love you. Get on the bus.\"",
    );
    note(
      "pt_note_es_cuecards",
      "Cue Cards (Tomorrow Hour)",
      "A rubber-banded stack",
      '1. "GOOD EVENING, AMERICA!" (wait for applause)\n2. "Tonight on the Tomorrow Hour: Jolly Jack Johnson! The Civil Defense Singers! And a very special message about YOUR FAMILY\'S FUTURE!"\n3. "Folks, they ask me — Jack, what happens when the bombs fall? And I tell them: I\'ll be in a Civil Defense shelter, doing two shows a night!" (big laugh — if no laugh, Mr. Showtime to sound cue 12)\n4. "...and remember: the safest place to watch tomorrow is from a Civil Defense shelter!" (APPLAUSE sign — HOLD IT)\n\n[Pencilled on the last card:] Harold — your teletype password is APPLAUSE. You made me write it down. Burn this. — Sid',
      { learn: "pt_es_producer" },
    );
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
