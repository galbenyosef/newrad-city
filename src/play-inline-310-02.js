// play-inline-310 02 — title
// Lines 16-320 of readable/play-inline-310.pretty.js (statement-aligned).
  const P = G._pe;

  P.LOCKS = {
    dn_morgue_safe: {
      id: "pe_dn_morgue_safe",
      label: "Morgue Safe",
      kind: "safe",
      code: "2207",
      hint: "The Morgue teletype upstairs in the First Journal; the style-desk note in the newsroom.",
    },
    nyl_exec_safe: {
      id: "pe_nyl_exec_safe",
      label: "Executive Safe",
      kind: "safe",
      code: "1845",
      hint: "Van Dusen's note in the New York Life executive office.",
    },
    nyl_deposit_1: {
      id: "pe_nyl_deposit_1",
      label: "Policy Vault — Deposit Box 1",
      kind: "safe",
      code: "3316",
      hint: "The night guard's note at the New York Life security desk.",
    },
    tc_wall_safe: {
      id: "pe_tc_wall_safe",
      label: "Hollingsworth Wall Safe",
      kind: "safe",
      code: "0614",
      hint: "The Hollingsworth tape reel in Tudor City apartment 2D.",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);

  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "note",
            name,
            title: name,
            text,
            weight: 0,
            value: 0,
            tags: ["note"],
          },
          extra || {},
        ),
      );
    const tape = (id, name, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title: name,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );
    const val = (id, name, value, desc, w) =>
      d({
        id,
        type: "misc",
        name,
        weight: w || 0.2,
        value,
        tags: ["valuable"],
        desc,
      });

    // ---- The First Journal Building ----
    tape(
      "pe_reel_lastedition",
      "Tape Reel: The Last Edition",
      "[A newsroom: typewriters, a ringing phone nobody answers.]\n\n\"Hold the front page. HOLD it. ...No, I don't care what the wire says about Moscow, the planes are coming in from the EAST, over the Atlantic. Get me London. Get me Paris. Somebody get me anybody. ...Fine. Headline: WAR. Two words: BOMBS FALLING. Run it. Run all of it. If there's nobody left to read it, at least it'll be right.\"",
    );
    note(
      "pe_note_foreman",
      "Pressroom Foreman's Note",
      "PRESS 2 — DO NOT START.\nThe main drive motor throws sparks into the ink trough. Either fix the brushes or keep a fire bucket by the lever.\nWe printed eleven thousand copies of the last edition before the power went. Nobody came to collect them. They are still on the dock.\n— Sal",
    );
    note(
      "pe_note_style",
      "Style Desk Memo",
      'STYLE NOTES FOR THE DAILY RUIN\n\n- It is "the Bombing", not "the Big One".\n- Raiders are "raiders". Not "gentlemen of the road". Looking at you, Scoop.\n- The Morgue safe answers to 2-2-0-7 now. The old combination was printed in last week\'s crossword by mistake. Do NOT print this one.\n- One scrip per copy. No credit. No exceptions. Not even for Scoop.',
      { learn: "pe_dn_morgue_safe" },
    );
    val(
      "pe_dn_press_photo",
      "Press Photograph (Mar. 5, 1967)",
      160,
      "A glossy eight-by-ten: the Manhattan skyline from the Queensboro Bridge, a second sun rising behind the Bronx. Stamped on the back: NOT FOR PUBLICATION.",
    );

    // ---- Tudor City ----
    note(
      "pe_note_decree",
      "Decree of the Tudor Court",
      "BY ORDER OF HIS MAJESTY THE LORD PROTECTOR OF TUDOR CITY:\n\n1. All who pass beneath the Terrace shall KNEEL.\n2. Tribute: ten scrip, or a can of something, or a shoe.\n3. The newspaper man in 2B shall write this decree out neatly until it sounds royal.\n4. Anyone who laughs at the Court shall be thrown off the Terrace. It is not very high. That is not the point.\n5. The ROYAL LAMPLIGHTER keeps the sign lit and holds the roof, by Royal Warrant. She does not kneel. She is excused kneeling. Nobody goes up without her say.",
    );
    tape(
      "pe_reel_hollingsworth",
      "Tape Reel: The Hollingsworths' Sunday Breakfast",
      '[Cutlery. A man clears his throat.]\n\n"—and so, before the eggs go cold: Margaret and I will not be going to the shelter. Our boys are in Europe, and if Europe has done this, we would rather not hear how it ended for them. We will have our Sunday breakfast. The good china. The jewellery goes in the wall safe — 0-6-1-4, our wedding day, children, as you all know — and whoever comes after may have it, with our compliments." [Glasses touch. The sirens start. The tape keeps running through a long, quiet meal.]',
      { learn: "pe_tc_wall_safe" },
    );
    note(
      "pe_note_scoop_notes",
      "Scoop Delaney's Notebook",
      'THE COURT — notes for the story nobody will print\n\n- The "Lord Protector" was a doorman at the Windsor before the Bombing. Still wears the cap.\n- Twelve guns. Four of them work.\n- The chest by his throne holds the key to my door. I have asked politely. Twice.\n- The only one who doesn\'t kneel is the girl on the roof. "Flint." Keeps the big sign lit; in exchange the roof is hers. The King calls her the Royal Lamplighter and is plainly terrified of her. Old Sol at the front desk brings her soup.\n- Headline idea: KING OF NOTHING. Headline idea 2: GET ME OUT OF HERE.',
    );
    val(
      "pe_tc_ring",
      "Hollingsworth Wedding Ring",
      220,
      'A plain gold band engraved "M. & A. — June 14, 1931".',
    );
    d({
      id: "pe_tc_key_cell",
      type: "misc",
      name: "Tudor Court Key Ring",
      weight: 0.1,
      value: 5,
      tags: ["junk"],
      desc: "Three keys on a bent coat hanger. One is labelled 2B. The door it fits is already off its hinges.",
    });

    // ---- The New York Life Building ----
    note(
      "pe_note_vandusen",
      "Note from H. W. Van Dusen",
      "Miss Kerrigan —\n\nI am going down to the lobby with the others. Should I not come back up, the Board's papers are in my safe. The combination is the year the Company was founded: 1845. I can't think why I ever believed that was clever.\n\nPlease see that the policyholders are paid. All of them. Today, if possible.\n\n— H.W.V.",
      { learn: "pe_nyl_exec_safe" },
    );
    note(
      "pe_note_night_guard",
      "Night Guard's Note",
      'Eddie — something big got into the attic through the pyramid. I heard it walking on the gold. Not going up there.\n\nIf the day shift asks: Deposit Box 1 in the Policy Vault is the one Mr. Van Dusen keeps for "emergencies". The box keypad is 3-3-1-6. Tell them I said so and I\'m sorry and I went home to Queens.\n— Walt',
      { learn: "pe_nyl_deposit_1" },
    );
    tape(
      "pe_reel_gilt",
      "Tape Reel: Zoo Keeper's Field Recording",
      '[Wind through broken glass. Something enormous breathing.]\n\n"Central Park Zoo keeper Dunleavy, field note. The female we lost from the bear grotto has made a den in the golden pyramid on Madison Square. Burned coat, ash-grey, half again the size she was. The settlers call her Old Gilt. She has a cub up here. Recommend nobody comes up these stairs. Recommend I stop coming up these stairs."',
    );
    val(
      "pe_nyl_pocketwatch",
      "Gold Pocket Watch (New York Life)",
      240,
      "Presented to H. W. Van Dusen for forty years' service. Stopped at 6:12.",
    );
    val(
      "pe_nyl_policy",
      "Paid-Up Life Policy",
      40,
      'Whole life, paid in full, for a man named Walter Kowalewski of Astoria. The beneficiary line reads "whoever finds this".',
      0.1,
    );
  }

  function defineTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    const T = (id, def) =>
      P.safe("term:" + id, () => G.terminals.register(id, def));
    const H = (s) => "MERIDIAN TELETYPE CO. — TELELINK\n" + s;
    T("pe_dn_editor", {
      title: "CITY EDITOR",
      header: H("The First Journal — Editor's Office"),
      entries: [
        {
          title: "Assignment Desk",
          text: 'DELANEY: Tudor City, the "Court". Find out who the king is.\nRUIZ: the bear on Madison Square. Take a camera. Take a long lens.\nEVERYONE ELSE: sell papers.',
        },
        {
          title: "From the Publisher",
          text: "We print. Whatever is left of this city deserves to know what happened yesterday. That is the whole job. It was always the whole job.",
        },
      ],
    });
    T("pe_dn_morgue", {
      title: "THE MORGUE — ARCHIVE",
      header: H("Clippings Library"),
      entries: [
        {
          title: "Index: 1967",
          text: 'JAN: Paris recalls envoy.\nFEB: Civil Defense drills in every school.\nMAR 2: "Bureau Sept" spy trial in Washington.\nMAR 4: the Atlantic fleet is "on manoeuvres".\nMAR 5: [no further entries]',
        },
        {
          title: "Safe Register",
          learn: "pe_dn_morgue_safe",
          text: "MORGUE SAFE: originals of the Mar. 5 photographs. Combination 2207. Librarian only.",
        },
      ],
    });
    T("pe_dn_press", {
      title: "PRESS CONTROL",
      header: H("Pressroom — Line 1 / Line 2"),
      entries: [
        {
          title: "Status",
          text: "LINE 1: READY.\nLINE 2: FAULT — MAIN DRIVE BRUSHES.\nINK: 40%. PAPER: 6 reels.",
        },
      ],
    });
    T("pe_dn_globe", {
      title: "THE GLOBE — CONTROL DESK",
      header: H("Rotunda Exhibit"),
      entries: [
        {
          title: "Rotation",
          text: "GLOBE ROTATION: ONE TURN PER TEN MINUTES.\nThe world still turns. Please do not climb it.",
        },
        {
          title: "World Clocks",
          text: "NEW YORK, LONDON, PARIS, MOSCOW, TOKYO.\nAll five stopped within the same minute.",
        },
      ],
    });
    T("pe_tc_lord", {
      title: "HIS MAJESTY'S TELETYPE",
      header: H("The Tudor Court — Royal Office"),
      entries: [
        {
          title: "Royal Ledger",
          text: "TRIBUTE RECEIVED: 340 scrip, 61 cans, 19 shoes (left).\nTRIBUTE OWED: by the Market, everything.",
        },
        {
          title: "Royal Speech (draft)",
          text: "Subjects! When the bombs fell, the kings of the world fled. I stayed. I held the door. I am still holding the door. KNEEL.",
        },
        {
          title: "Royal Warrants",
          text: 'THE ROYAL LAMPLIGHTER ("Flint"): the roof, the sign and the stair to the upper floors, for as long as the TUDOR CITY sign burns every night. Excused kneeling. Excused tribute. Do NOT send anyone up to collect.\nTHE FRONT DESK (S. Abramowitz): the lobby, the mail and the soup kettle. Excused kneeling on account of his knees.\nVISITORS: kneel, ten scrip, or see the Lamplighter about the fire escape. (She will say no.)',
        },
      ],
    });
    T("pe_tc_super", {
      title: "SUPERINTENDENT",
      header: H("Tudor City Management — Tudor Tower"),
      entries: [
        {
          title: "Work Orders",
          text: '2D: tenants request no disturbance "for the duration". Granted.\nROOF: the TUDOR CITY sign breaker trips in rain. Reset at the roof panel. (The Lamplighter sees to it now. Leave her be.)\n9C: sealed by the tenant, 1968. Sol keeps the key. Sol has lost the key, he says.\nSERVICE ELEVATOR: runs between the Hall and the third floor only.',
        },
      ],
    });
    T("pe_nyl_security", {
      title: "LOBBY SECURITY",
      header: H("New York Life Insurance Company"),
      entries: [
        {
          title: "Night Log",
          text: "MAR 4 1967 22:10 — Rounds complete.\nMAR 5 1967 09:40 — Sirens. Sunday skeleton staff to the basement.\n(Later, pencil:) Something on the pyramid. Heavy.",
        },
        {
          title: "Policy Vault — Box Register",
          learn: "pe_nyl_deposit_1",
          text: "BOX 1 (Executive reserve): keypad 3316.\nBOXES 2-40: key holders only.",
        },
      ],
    });
    T("pe_nyl_exec", {
      title: "OFFICE OF THE PRESIDENT",
      header: H("H. W. Van Dusen"),
      entries: [
        {
          title: "Correspondence",
          text: "To the Board: claims arising from an act of war are excluded. I have decided we will pay them anyway. Every one. Call it the last act of a life insurance company.",
        },
      ],
    });
    T("pe_nyl_actuary", {
      title: "ACTUARIAL TABULATOR",
      header: H("Mortality Tables — Department 4"),
      entries: [
        {
          title: "Projection, Feb. 1967",
          text: "LIFE EXPECTANCY, BOROUGH OF MANHATTAN: [RECALCULATING]\nLIFE EXPECTANCY, BOROUGH OF MANHATTAN: [RECALCULATING]\nRecommendation: stop recalculating.",
        },
      ],
    });
  }

  P.addBuilder(
    "pe_content",
    () => {
      P.safe("items", defineItems);
      P.safe("terminals", defineTerminals);
    },
    1,
  );
