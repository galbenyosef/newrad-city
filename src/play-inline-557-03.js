// play-inline-557 03 — gender
// Lines 364-638 of readable/play-inline-557.pretty.js (statement-aligned).
  R.push(
    gh({
      id: "neon_patient2",
      name: "Agnes Kowalczyk",
      role: "patient",
      outfit: "settler",
      gender: "f",
      hat: "bandana",
      hatColor: 0x6a5a6a,
      ai: "sit",
      voice: "settler",
      level: 3,
      dialogue: "dlg_neon_patient",
      where: [["clinic_waiting_1"], null],
      barks: {
        idle: [
          "Been waiting since '81.",
          "*coughs* Excuse me. That was a lung.",
          "Is it my turn? It's never my turn.",
        ],
      },
    }),
  );
  R.push(
    gh({
      id: "neon_rocco",
      name: "Rocco",
      role: "bartender",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      voice: "merchant",
      level: 6,
      routine: "venue",
      dialogue: "dlg_neon_rocco",
      merchant: { scrip: 350, stock: STOCK.club, restock: 2 },
      where: [["club_bar"], null],
      barks: {
        greet: [
          "A topsider in the Club. Somebody pinch me. Gently, I bruise.",
          "What'll it be, honorary?",
        ],
        idle: [
          "*polishes a glass with a rag that makes it dirtier*",
          "Last call is when I say it is.",
        ],
      },
    }),
  );
  const CLUB = [
    ["neon_club1", "Countess Vivienne Roth", "f", 1],
    ["neon_club2", "Mortimer Graves", "m", 2],
    ["neon_club3", "Lulu LaBelle", "f", 3],
  ];
  for (const [id, name, gender, n] of CLUB)
    R.push(
      gh({
        id,
        name,
        role: "clubber",
        outfit: gender === "f" ? "survivor_layers" : "merchant",
        gender,
        hat: gender === "m" ? "fedora" : undefined,
        hatColor: 0x1a1a1a,
        ai: "sit",
        voice: "settler",
        level: 3,
        routine: "clubber",
        dialogue: "dlg_neon_clubber",
        where: [["club_patron_" + n], null],
        barks: {
          idle: pick([
            [
              "Darling, the sheer good health of that topsider. Obscene.",
              "Another Meltdown, Rocco.",
            ],
            [
              "*laughs until it turns into a cough*",
              "Smiley's off tonight. He's always off. That's the act.",
            ],
            [
              "Twenty-two years and they STILL haven't fixed the ice machine.",
              "Mm. Divine.",
            ],
          ]),
        },
      }),
    );
  const SPEAK = [
    ["neon_speak1", "Pinky Nolan", "m", 1],
    ["neon_speak2", "Dutch Van Laer", "m", 2],
  ];
  for (const [id, name, gender, n] of SPEAK)
    R.push(
      gh({
        id,
        name,
        role: "barfly",
        outfit: n === 1 ? "drifter" : "merchant",
        gender,
        hat: n === 1 ? "cap" : "fedora",
        hatColor: 0x2a2a2a,
        ai: "sit",
        voice: "settler",
        level: 4,
        routine: "barfly",
        dialogue: "dlg_neon_speakeasy",
        where: [["speakeasy_patron_" + n], null],
        barks: {
          idle: [
            "Shh.",
            "Nobody knows about this place. Keep it that way.",
            "*sips something that smells like a chemistry set*",
          ],
        },
      }),
    );
  R.push(
    gh({
      id: "neon_sarge",
      name: "Sergeant Otis Mulroney",
      role: "sergeant",
      outfit: "combat_armor",
      gender: "m",
      hat: "beret",
      hatColor: 0x7a1c1c,
      ai: "static",
      voice: "guard",
      level: 12,
      weapon: ["combat_shotgun", "assault_rifle"],
      essential: true,
      dialogue: "dlg_neon_sarge",
      merchant: { scrip: 800, stock: STOCK.armory, restock: 3 },
      where: [["barracks_sergeant"], null],
      barks: {
        greet: [
          "Barracks. State your business or state your funeral arrangements.",
          "Mulroney. Quartermaster, drill sergeant, and the only man in the Neon who can count to ten twice.",
        ],
        idle: [
          "Rifles clean, boots dry, jokes clean. Two out of three.",
          "Who touched my coffee? It wasn't coffee. Who touched it?",
          "Contracts on the board. Scrip on the table.",
        ],
      },
    }),
  );
  for (let k = 1; k <= 2; k++)
    R.push(
      gh({
        id: "neon_night" + k,
        name: "Neon Guard",
        role: "patrol",
        outfit: "leather_armor",
        gender: k === 1 ? "f" : "m",
        hat: "beret",
        hatColor: 0x7a1c1c,
        level: 9,
        weapon: [k === 1 ? "hunting_rifle" : "smg_10mm", "pistol_10mm"],
        ai: "patrol",
        voice: "guard",
        dialogue: "dlg_neon_guard",
        guard: true,
        routine: "nightwatch",
        where: [
          ["crowd_" + k * 7],
          { near: ["plaza_centre", "center"], dx: k === 1 ? -12 : 12, dz: -6 },
        ],
      }),
    );
  R.push(
    gh({
      id: "neon_clerk",
      name: "Lydia Pham",
      role: "clerk",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      voice: "merchant",
      level: 5,
      routine: "shop_keep",
      faction: "settlers",
      dialogue: "dlg_neon_clerk",
      merchant: { scrip: 400, stock: STOCK.clerk, restock: 2 },
      where: [["depot_clerk"], null],
      barks: {
        greet: [
          "Depot office. Manifests, tolls, lost oxen. Which one?",
          "Lydia Pham, Depot books. If it moves through the Neon, it moves through me.",
        ],
        idle: [
          "Forty crates in, thirty-eight out. Where'd two crates go?",
          "*stamps something very hard*",
        ],
      },
    }),
  );
  R.push(
    gh({
      id: "neon_stagehand",
      name: "Bertie Quill",
      role: "stagehand",
      outfit: "drifter",
      gender: "m",
      hat: "cap",
      hatColor: 0x3a3a3a,
      ai: "static",
      voice: "settler",
      level: 3,
      routine: "director",
      dialogue: "dlg_neon_stagehand",
      where: [["opry_wings", "opry_backstage"], null],
      barks: {
        greet: [
          "Mind the sandbags. Mind the ropes. Mind the Velvet.",
          "Stage crew. Which means ALL the crew.",
        ],
        idle: [
          "Who moved my tape marks?!",
          "Spot's flickering again…",
          "*coils a rope with great tenderness*",
        ],
      },
    }),
  );
  for (const d of R) T.ROSTER.push(d);

  // ------------------------------------------------------------------
  // Items
  // ------------------------------------------------------------------
  L.hook("init", function () {
    L.defineItem({
      id: "q_crowe_button",
      name: '"VOTE CROWE" Button',
      type: "misc",
      weight: 0,
      value: 1,
      mesh: "paper",
      desc: 'A tin campaign button: a top hat, a grin with most of its teeth, and "CROWE — HE\'S STILL HERE!" There has not been an election in the Neon since 1971.',
    });
    L.defineItem({
      id: "q_neon_postcard",
      type: "note",
      name: "Neon Postcard",
      title: "GREETINGS FROM TIMES SQUARE",
      weight: 0,
      value: 2,
      noLoot: true,
      text: 'GREETINGS FROM TIMES SQUARE — "THE CROSSROADS OF THE WORLD"\n\n[On the back, in careful handwriting:]\nDear Mom — the lights are brighter than the pictures. The people are louder. Nobody bit me. Having a wonderful time. Please send scrip.\n\n[Postage: a Fizzo Cola label, glued on.]',
    });
  });

  // ------------------------------------------------------------------
  // Dialogues
  // ------------------------------------------------------------------
  const STALL_TALK = {
    neon_smokes: {
      who: "Ran a newsstand on the corner of 43rd for thirty years. Then the bombs. Then another twenty-two years on the same corner. I'm nothing if not loyal to a corner.",
      tip: "Matches get damp. Buy ten. Buy twenty. You'll thank Sid the night the generator quits and you're standing in the dark with a can of beans.",
    },
    neon_tinker: {
      who: "Joe sells junk in the daytime, I sell junk at night. Same junk, sometimes. We've never met. It's better that way.",
      tip: "Busted cameras have a lens and a coil. Busted typewriters have springs. Nothing's junk if you know what's inside it.",
    },
    neon_sadie: {
      who: "I sold \"I ♥ NY\" shirts on this very square in March of '67. Then the sky lit up. Figured — why stop now? Tourists came back eventually. Took 'em a while.",
      tip: "Old-world dollars are no good for buying, but Goldie at the Pawn Palace pays good for it. Funny, huh? Paper finally worth something.",
    },
    neon_hotdog: {
      who:
        "Frankie Franks. My father was Frankie Franks. HIS father was a Frankie too, but he sold knishes, we don't talk about him. Pop bought into Forever Franks in '66: the franchise manual, the sign with the little fella in the top hat holding his hourglass, the works. " +
        'Home office never sent the second invoice. I still run it by the manual. Page one: "Smile. The customer is the reason the frank exists."',
      tip: "Eat before you sleep and eat before you fight. Frankie's Rule. Violate it and you're lunch.",
    },
  };
