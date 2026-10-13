// play-inline-161 03 — tags
// Lines 293-614 of readable/play-inline-161.pretty.js (statement-aligned).
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
    // AMNH
    note(
      "pu_note_worksheet",
      "Field Trip Worksheet",
      "P.S. 87 — Museum Field Trip — Grade 4",
      'NAME: Timmy K.\n\n1. How tall is the Barosaurus?  "Taller than Dad\'s bomb shelter."\n2. What did dinosaurs eat?  "Other dinosaurs and Communists."\n' +
        '3. Why did the dinosaurs go extinct?  "Mrs. Albright says a big rock. Billy says atomic war. Billy is going to the principal."\n4. Draw your favorite exhibit:\n' +
        "[A crayon drawing of something with long horns and very long claws. Labelled: RIPJAW (REAL). Gold star.]",
    );
    tape(
      "pu_reel_akeley",
      'Tape reel: "Akeley Expedition, Reel 3"',
      "Narration track — Hall of African Mammals, 1956 re-edit",
      '[Crackling orchestral swell] "...and here, in the shadow of the Mountains of the Moon, the explorer pauses to consider his quarry. For Man, alone among the ' +
        "beasts, hunts not from hunger but from curiosity...\" [a second, much later voice cuts in] \"Curiosity's why I'm in here, pal. Lions in the glass didn't " +
        "move. Lion that came up the stairs did. Kept the hat, though. Hat's a good hat.\"",
    );
    note(
      "pu_note_halvorsen",
      "Curator Halvorsen's Memo",
      "INTERNAL — Dept. of Vertebrate Paleontology",
      'Re: specimen DC-77 ("Unguis mortis"), on loan from the Tonopah Research Station.\n\nI have now been told three times that it is a CAST. Casts do not arrive in a ' +
        "refrigerated crate stamped KESSLER-HAAS. Casts do not have soft tissue. And casts, gentlemen, do not lay eggs.\n\nThe three objects found in the Dinosaur Hall " +
        'on Tuesday have been placed in the incubator "for safekeeping" on the orders of a Mr. Grayson of the Department of Defense, who also asked me to stop ' +
        "writing memos.\n\nThis is a memo. And Mr. Grayson may whistle for my teletype password. (It is UNGUIS. Nobody reads memos.) — E. Halvorsen",
      { learn: "pu_amnh_collections" },
    );
    note(
      "pu_note_ocean",
      "Maintenance Request #7741",
      "Buildings & Grounds — Milstein Hall",
      "Sump pump #2 in Ocean Life has failed AGAIN. Water on the lower floor, and it's glowing. Mr. Pruitt says that's the new \"ambient lighting\". It is not " +
        "ambient lighting. Please send a plumber, a Geiger counter, and possibly a priest.",
    );
    tape(
      "pu_reel_projectionist",
      "Tape reel: Projectionist's Log",
      "Hayden Planetarium — Projection Booth",
      '"Show 4,117. Standing room only — never seen the like. Everybody wants to see the stars before the Reds take them away. Old Zeiss is running hot, so I ' +
        "put in the Mark IV cell from the Army lot. Runs forever, those things. Twenty-two years, the salesman said. I laughed.\n\n[sirens, distant] ...Folks " +
        "are asking if they can stay for the next show. Sure. Sure, you can all stay. I'll dim the house lights. The box office takings are in the booth safe — " +
        "combination's the show number, four-one-one-seven, so I can't forget it.\"",
      { learn: "pu_amnh_star_safe" },
    );
    d({
      id: "pu_star_chart",
      type: "misc",
      name: "Hayden Star Chart (1967)",
      weight: 0.1,
      value: 60,
      mesh: "paper",
      tags: ["valuable"],
      desc: "A gilt-edged planisphere of the New York sky, March 1967. Collectors still pay for proof the sky used to be blue.",
    });
    d({
      id: "pu_pith_helmet",
      type: "apparel",
      slot: "head",
      name: "Explorer's Pith Helmet",
      weight: 1,
      value: 90,
      dr: 3,
      attrs: { senses: 1 },
      skills: { survival: 5 },
      mesh: "helmet_army",
      tags: ["apparel", "hat", "unique"],
      desc: "Cork, khaki and a hundred and fifty years of Manhattan dust. Once belonged to a man who shot elephants for science.",
    });
    d({
      id: "pu_ripjaw_egg",
      type: "aid",
      name: "Ripjaw Egg",
      weight: 2,
      value: 120,
      mesh: "ball",
      sound: "eat",
      tags: ["food", "raw", "rare"],
      effects: { hpOverTime: [45, 8], rads: 8 },
      desc: "Leathery, warm, and faintly ticking. Chef Gaston at the Plaza would give his whisk for one.",
    });
    d({
      id: "pu_planetarium_cell",
      type: "misc",
      name: "Planetarium Power Cell (Mark IV)",
      weight: 4,
      value: 250,
      mesh: "battery",
      quest: true,
      tags: ["quest"],
      desc: "An Army-surplus Mark IV cell pulled from the Hayden star projector. Still humming after two decades. The stars went out when you took it.",
    });
    // Dakota
    d({
      id: "pu_key_hollis",
      type: "key",
      name: "Hollis Apartment Key",
      weight: 0,
      value: 0,
      mesh: "key",
      noLoot: true,
      tags: ["key"],
      desc: 'A heavy brass key on a tag: "3B — HOLLIS — DO NOT ISSUE".',
    });
    note(
      "pu_note_super",
      "Superintendent's Note",
      "Tacked above the key board",
      "RUIZ — The board says 3B stays SEALED. I don't care what you hear at night. It's the pipes. Pipes don't sing lullabies? These ones do. KEY STAYS IN MY DESK.\n\n" +
        "P.S. Boiler's leaking something green again. If I start glowing, I quit.",
    );
    note(
      "pu_note_concierge",
      "Concierge's Log Book",
      "The Dakota — Front Desk, March 1967",
      'Mar 3 — Mr. Hollis (3B) away on tour. Mrs. Hollis indisposed. Nursery unit ("Nanny") complaining of "insufficient bedtime stories" to the elevator.\n' +
        "Mar 4 — Mrs. Hollister (3A) reports singing through the wall. Very pretty. Not a complaint, she says.\nMar 5 — Sirens. Board votes to seal the building. " +
        'Nobody in, nobody out. Mrs. Hollis did not answer the door. Nanny answered for her. "The baby is sleeping. Please use your indoor voice."',
    );
    note(
      "pu_note_dinner",
      "Place Card",
      "The Pell Breakfast — Sunday, March 5th",
      'Menu: Eggs Benedict · Kedgeree · Champagne Cocktails\n\nSeating: Mr. & Mrs. Pell · the Van Rensselaers · Dr. Abernathy\n\nOn the back, in pencil: "Howard says if ' +
        'we just keep eating, the sirens will stop. Howard has always been an idiot. Pass the salt."\n\nUnderneath, in Howard\'s hand: "Safe is my birthday, dear. ' +
        'Oh-four-twelve. Get the bonds out if they come."',
      { learn: "pu_dakota_pell_safe" },
    );
    d({
      id: "pu_score",
      type: "misc",
      name: '"Lullaby for Ada" (Manuscript Score)',
      weight: 0.5,
      value: 40,
      mesh: "book",
      quest: true,
      tags: ["quest"],
      desc: 'Julius Hollis\'s only completed symphony, in his own hand, a lullaby written for his newborn daughter. The last page is annotated: "For the first night of the new world."',
    });
    tape(
      "pu_reel_hollis1",
      'Tape reel: "For Ada, Movement I"',
      "J. Hollis — composer's sketch",
      "[piano, a gentle four-note figure, repeated] \"Ada. That's the theme. Four notes, like your name, if your name were a bit longer. When you're old enough, the " +
        'Philharmonic will play it at Carnegie Hall and you\'ll be terribly embarrassed. That\'s what fathers are for." [a baby gurgles] "See? She agrees."',
    );
    tape(
      "pu_reel_hollis2",
      'Tape reel: "Nanny — Standing Orders"',
      "American Automaton Tot-Minder unit — owner programming",
      "\"Nanny, this is Margaret Hollis. Standing orders: if anything happens — anything — you keep Ada calm. You sing to her. You don't stop singing until she's " +
        'grown. Do you understand?"\n\nNANNY: "Understood, Mrs. Hollis. I will not stop singing until Ada is grown."\n\n"...Good. Good girl. I\'m going to lie down for a bit."',
    );
    d({
      id: "pu_hollis_locket",
      type: "misc",
      name: "Hollis Family Locket",
      weight: 0.1,
      value: 150,
      mesh: "tag",
      tags: ["valuable"],
      desc: "A gold locket. Inside: a man at a piano, a woman laughing, and a very small, very bald baby.",
    });
    // Plaza
    note(
      "pu_note_guest",
      "Hotel Stationery",
      "THE PLAZA — Fifth Avenue at Central Park South",
      'Dearest Mother — The hotel is marvellous. They have announced that the "situation" will not affect the Sunday brunch. The orchestra is playing. Everybody is ' +
        "dancing. I have decided that if the world is ending I shall be found in my good pearls. Do not wait up. — Winifred\n\n" +
        "P.S. Daddy's suite safe is 2-2-1-5, should anyone need the bonds. I shan't.",
      { learn: "pu_plaza_pres_safe" },
    );
    d({
      id: "pu_society_charter",
      type: "note",
      name: "Charter of the Plaza Society",
      title: "CHARTER OF THE PLAZA SOCIETY (Revised, 1981)",
      weight: 0,
      value: 0,
      tags: ["note"],
      text:
        'ARTICLE I. The War is to be referred to only as "the Unpleasantness".\nARTICLE II. Dinner is at eight. Radiation is no excuse for lateness.\n' +
        "ARTICLE III. Members shall dress for dinner. Exo-rig is not formal wear, regardless of polish.\nARTICLE IV. Persons of no fixed address may be admitted, provided they are " +
        "old money.\nARTICLE V. The Society shall maintain the Last Cotillion in perpetuity, or until the band returns, whichever comes first.",
    });
    d({
      id: "pu_key_suite",
      type: "key",
      name: "Plaza Suite 610 Key",
      weight: 0,
      value: 0,
      mesh: "key",
      noLoot: true,
      tags: ["key"],
      desc: "A brass key on a velvet tassel. The tag reads 610.",
    });
    // Carnegie
    note(
      "pu_note_bell",
      "Programme Notes",
      "The Carnegie Consort — Opening Night (draft)",
      'PROGRAMME: Hollis — Symphony No. 1, "Lullaby for Ada" (world premiere, 22 years late)\n\nNEEDS:\n  1. The score (Hollis lived at the Dakota. The Dakota ' +
        "is... the Dakota.)\n  2. POWER. Dynamo No. 2 wants a cell. A real one. Not a potato and two wires, Rudy.\n  3. An audience with money. The Plaza lot have " +
        "money and nothing to do with it. Pride, too. Use it.\n\n— I.B.",
    );
    d({
      id: "pu_maestro_tails",
      type: "apparel",
      slot: "body",
      name: "Maestro's Tails",
      weight: 2,
      value: 180,
      dr: 2,
      attrs: { presence: 2 },
      skills: { persuasion: 10 },
      outfit: "merchant",
      mesh: "cloth_black",
      tags: ["apparel", "clothing", "old_world", "unique"],
      desc: "Maestro Bell's second-best tailcoat, presented after the Consort's first concert in two decades. The lapels still smell faintly of rosin and applause.",
    });
    // Tiffany
    d({
      id: "pu_tiffany_ring",
      type: "misc",
      name: "Tiffany Engagement Ring",
      weight: 0.05,
      value: 180,
      mesh: "tag",
      tags: ["valuable"],
      desc: "Platinum, one carat, in a little blue box. Someone was going to ask a very important question.",
    });
    d({
      id: "pu_diamond_chip",
      type: "misc",
      name: "Loose Diamond",
      weight: 0.01,
      value: 75,
      mesh: "tag",
      tags: ["valuable"],
      desc: "A cut stone, pried from its setting by somebody in a hurry.",
    });
    d({
      id: "pu_atlas_diamond",
      type: "misc",
      name: "The Atlas Diamond",
      weight: 0.2,
      value: 2500,
      mesh: "statuette",
      tags: ["valuable", "unique"],
      desc: 'A canary-yellow diamond the size of a Fizzo Cola cap, cut into ninety facets. Old-world insurers valued it at "don\'t even ask". Lady Constance at the Plaza would sell her own mother for it. Several times.',
    });
    d({
      id: "pu_key_tiffany_vault",
      type: "key",
      name: "Tiffany Vault Key",
      weight: 0,
      value: 0,
      mesh: "key",
      noLoot: true,
      tags: ["key"],
      desc: "A long steel key with a Mosler tag. The Raider Boss wore it on a chain like a medal.",
    });
    note(
      "pu_note_guard",
      "Night Watchman's Note",
      "Tiffany & Co. — Security",
      'Sarge — the Kowalski boys came in "to buy a ring" at 9:40 with duffel bags and no mother. The sirens went at 9:46. At 9:47 the time lock fired on its own and ' +
        "shut the vault with them inside. I figure they're safer in there than we are out here.\n\nOverride for the time lock is on the security teletype (password MOSLER, same as always). I'm not " +
        "opening it. Let 'em have the diamond. — Walt",
      { learn: "pu_tiffany_security" },
    );
    tape(
      "pu_reel_heist",
      'Tape reel: "Heist Crew, 5 Mar"',
      "Recorded inside the Tiffany vault",
      "\"Okay. Okay okay okay. Vault shut itself. That's fine. Time lock opens at nine tomorrow. Monday. We just wait. [muffled boom] ...That was a big truck. " +
        "[second boom, bigger] That was a very big truck.\n\nEddie says we split the Atlas three ways. I say we're rich. Frankie says we're dead. Frankie's " +
        'always so negative."',
    );
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
