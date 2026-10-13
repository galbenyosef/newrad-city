// play-inline-32 04 — artist
// Lines 726-856 of readable/play-inline-32.pretty.js (statement-aligned).
  T.classicalPieces = [
    {
      title: "Nocturne in E minor",
      artist: "Josef Albrecht",
      style: "classical",
      form: "nocturne",
      key: "D",
      minor: true,
    },
    {
      title: "Sonata in C major, first movement",
      artist: "Friedrich Weller",
      style: "classical",
      form: "sonata",
      key: "C",
      minor: false,
    },
    {
      title: "Adagio for Strings in D minor",
      artist: "Clara Vandermeer",
      style: "classical",
      form: "adagio",
      key: "D",
      minor: true,
    },
    {
      title: "Hudson Waltz",
      artist: "Anton Lehrer",
      style: "classical",
      form: "waltz",
      key: "F",
      minor: false,
    },
    {
      title: "Sonatina in G",
      artist: "Aurelio Benedetti",
      style: "classical",
      form: "sonata",
      key: "G",
      minor: false,
    },
    {
      title: "Elegy for the Empire City",
      artist: "Clara Vandermeer",
      style: "classical",
      form: "adagio",
      key: "C",
      minor: true,
    },
    {
      title: "Nocturne in A-flat",
      artist: "Josef Albrecht",
      style: "classical",
      form: "nocturne",
      key: "Ab",
      minor: false,
    },
    {
      title: "Waltz of the Crystal Ballroom",
      artist: "Anton Lehrer",
      style: "classical",
      form: "waltz",
      key: "Bb",
      minor: false,
    },
    {
      title: "Sonata in A minor",
      artist: "Friedrich Weller",
      style: "classical",
      form: "sonata",
      key: "D",
      minor: true,
    },
  ];
  T.classicalIntro = [
    "Good evening. You are listening to Classical New York. Next, {artist}: {title}.",
    "Classical New York continues with {title}, by {artist}. A reminder that civilization, too, was here before the bombs.",
    "And now, from the archives of the old Philharmonic: {artist}'s {title}.",
    "Please, take a moment. Set down the rifle. Here is {title}.",
  ];
  T.classicalOutro = [
    "That was {title}, by {artist}. You are listening to Classical New York.",
    "{artist}. Some things endure. You are listening to Classical New York.",
    "Lovely. Classical New York will return after a brief moment of dignified silence.",
  ];

  // ------------------------------------------------------------------
  // RANGE-LIMITED SIGNALS (only on the dial within ~250 m of the source).
  // Tuning one in for the first time marks its location on the map and emits
  // 'radioSignalFound' for quests to hook.
  // ------------------------------------------------------------------
  T.signals = {
    // Cryo Unit C-4: a flooded Project Long Winter site's looping distress tape, from under Battery Park.
    c4: {
      speaker: "Director Brandt",
      profile: "director",
      lines: [
        "Mayday. Mayday. This is Facility Director Brandt of Cryo Unit C-4, Project Long Winter, Battery Park, Manhattan. The harbor has breached the seawall coupling. The pumps are down and the generator is dead. Every pod has been thawed. Sixty-one of us are waiting on the upper deck. Office of Civil Defense, if you receive this, please respond. Anyone. Please respond.",
        "This is Cryo Unit C-4. Day six since the breach. The pressure door is under water and we cannot open it from inside. To anyone who can hear this: the freight hatch is on the seawall, north of the old ferry pier. Please. This is Director Brandt. This message will repeat.",
      ],
    },
    // A numbers station by the U.N.: the Continuity's coded name readings (Static Okonkwo decodes them in
    // "Numbers Game"). The Morse repeats "Z MARLOW LIBERTY": Zeke is held on Liberty.
    numbers: {
      speaker: "Unidentified",
      profile: "numbers",
      morse: "Z MARLOW LIBERTY",
      lines: [
        "Attention. Attention. Seven. Four. Four. One. Nine. Three. Three. Eight. Zero. Two. One. Two. Zero. Five. Five. Repeat. Seven. Four. Four. One. Nine. Three. Three. Eight. Zero. Two. End of message.",
        "Attention. Group one. Six. Zero. Zero. Four. One. Group two. Nine. Nine. Two. Seven. Three. Group three. One. Two. Zero. One. Two. Zero. End of message.",
      ],
    },
    // Lancer Rask's exo-rig, pinned under a fallen gantry: the suit's automatic transponder.
    covenant: {
      speaker: "Exo-rig Transponder",
      profile: "transponder",
      lines: [
        "Iron Covenant exo-rig transponder. Lancer I. Rask, Survey Detail Harrow. Status: immobile. Repeat. Status: immobile.",
        "Iron Covenant exo-rig transponder. Lancer I. Rask, Survey Detail Harrow. Status: immobile. Any Covenant unit, respond on this frequency.",
      ],
    },
    // Bear Market Betty's "closing bell" ransom broadcast from the Stock Exchange.
    ransom: {
      speaker: "Bear Market Betty",
      profile: "raider",
      lines: [
        "Good evening, Manhattan, this is Bear Market Betty with the closing bell. Today's hot commodity: one convoy master, name of Harlan Pruitt, slightly used. Opening bid is five hundred in scrip, delivered to the Exchange by sundown. Every day you wait, the price goes up and Harlan goes down. One floor at a time.",
        "Market update from the Exchange. Harlan Pruitt is holding steady. Harlan Pruitt is also holding a rope. Five hundred scrip, Grand Central. You know where we are. Everybody knows where we are. That's the whole point.",
      ],
    },
  };
