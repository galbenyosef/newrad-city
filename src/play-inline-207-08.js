// play-inline-207 08 — responses
// Lines 3551-3785 of readable/play-inline-207.pretty.js (statement-aligned).
  PF.quest({
    id: "pf_shellback_omelette",
    name: "A Taste of the Sea",
    giver: "Nan Whitlock",
    location: "Fraunces Tavern",
    desc: "Nan Whitlock, who cooks at Fraunces Tavern, wants five shellback eggs from the hatchery on the tall ship at the South Street Seaport.",
    stages: [
      {
        id: "eggs",
        text: () =>
          "Collect shellback eggs at the South Street Seaport (" +
          Math.min(5, PF.inv.count("pf_shellback_egg")) +
          "/5).",
        markers: () => [{ x: 214, z: 705.5, label: "Shellback Nests" }],
      }, // the plaza clutch in front of the Fish Market (more on the Peking)
      {
        id: "bring",
        text: "Bring the eggs to Nan at Fraunces Tavern.",
        markers: () => [{ npc: "pf_ft_nan", label: "Nan Whitlock" }],
      },
    ],
    rewards: {
      xp: 150,
      scrip: 50,
      items: [
        ["pf_shellback_omelette", 3],
        ["pf_note_nan", 1],
      ],
    },
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "pf_shellback_egg" &&
      PF.q.stage("pf_shellback_omelette") === "eggs" &&
      PF.inv.count("pf_shellback_egg") >= 5
    )
      PF.q.set("pf_shellback_omelette", "bring");
  });

  // --- Dilly Nwosu (courtyard gardener): "Victory Garden" ---
  Object.assign(PF.flagDefaults, { ft_seeds: "", ft_seeds_bonus: false });
  PF.item({
    id: "pf_seed_tin",
    type: "misc",
    name: "Victory Garden Seed Tin",
    weight: 1,
    value: 40,
    quest: true,
    desc: 'A sealed olive-drab tin: "U.S. DEPT. OF AGRICULTURE — CIVIL DEFENSE SEED RESERVE — CORN · BEANS · SQUASH · TOMATO. KEEP COOL & DRY." It rattles like treasure.',
  });
  PF.item({
    id: "pf_note_seeds",
    type: "note",
    name: "Fulton Market Cold Store Tag",
    title: "Cold Store Inventory Tag — Bay 3",
    text: "SEASONAL: 12 crates cod (condemned). 4 bbl oysters (condemned).\nCIVIL DEFENSE: 1 SEED RESERVE TIN, Victory Garden assortment. Store below 50°F. DO NOT SELL. Property of the Borough of Manhattan.\n\n(Scrawled underneath:) if the bombs come, somebody plant these. — T.",
  });
  PF.dialogue("pf_dlg_dilly", {
    start: () => (PF.flag("ft_seeds") ? "after" : "root"),
    nodes: {
      root: {
        text: "Mind the beds. Dilly Nwosu, gardener, water-boss, and the only reason this yard eats anything but Cookie's mystery haunch. Spuds, plums, and a lot of hoping. You buying, or you helping?",
        responses: [
          {
            text: "I found a sealed seed tin at the fish market.",
            cond: () => PF.inv.count("pf_seed_tin") > 0,
            next: "tin",
          },
          {
            text: "What would help?",
            cond: () => !PF.q.started("pf_seeds"),
            next: "need",
          },
          {
            text: "Still looking for your seeds.",
            cond: () =>
              PF.q.active("pf_seeds") && PF.inv.count("pf_seed_tin") === 0,
            next: "hint",
          },
          { text: "Let's see what you're selling.", barter: true },
          { text: "I'll leave you to it." },
        ],
      },
      need: {
        text: "Seeds. Real ones, old-world, not mutated half to death. Spuds and plums keep us alive, but you can't feed a market on two crops. My dad swore the city put a civil-defense seed reserve in the cold store at the Fulton Fish Market — cold, dry, forgotten. Only now the whole Seaport crawls with shellbacks.",
        responses: [
          {
            text: "I'll get your seeds.",
            action: () => PF.q.start("pf_seeds"),
            next: "go",
          },
          {
            text: "[Trade 35] What's it worth to you?",
            check: { skill: "trade", value: 35 },
            action: () => {
              PF.setFlag("ft_seeds_bonus", true);
              PF.q.start("pf_seeds");
            },
            next: "worth",
            failNext: "cheap",
          },
          { text: "Shellbacks? No thanks." },
        ],
      },
      worth: {
        text: "Ha! A trader. Fine — bring me that tin and I'll add fifty scrip and first pick of every harvest. Deal?",
        responses: [{ text: "Deal.", next: "go" }],
      },
      cheap: {
        text: "Worth? It's worth my kids eating corn one day. That's what it's worth. Sixty scrip, same as anyone gets.",
        responses: [{ text: "Fair enough. I'll get them.", next: "go" }],
      },
      go: {
        text: "Cold store's in the old market hall at the Seaport, back past the stalls. Go in through the loading dock if the front's crawling. And don't open the tin — air gets in, they die.",
        responses: [{ text: "Understood." }],
      },
      hint: {
        text: "The Fulton Fish Market, at the Seaport. The walk-in cold store, back of the hall. Mind the shellbacks.",
        responses: [{ text: "On it." }],
      },
      tin: {
        text: "Is that — [She takes the tin in both hands, turns it, reads it, reads it again.] Corn. Beans. Squash. TOMATOES. Sealed. Oh, you beautiful, beautiful stranger. Do you know what this is? This is a future. This is the whole courtyard in green by spring.",
        responses: [
          {
            text: "It's yours. Plant them.",
            action: () => giveSeeds(false),
            next: "thanks",
          },
          {
            text: "[Persuasion 50] Seeds like these could feed half of Lower Manhattan. Share them with Trinity Sanctuary too.",
            check: { skill: "persuasion", value: 50 },
            action: () => giveSeeds(true),
            next: "share",
            failNext: "noshare",
          },
          { text: "Actually, I think I'll hold on to them.", next: "keep" },
        ],
      },
      share: {
        text: "...You're right. The Reverend's people have been eating potato peel since winter. Half to Trinity, then. [She tucks a handful into a twist of paper.] You're a good egg. Better than Nan's eggs, anyway.",
        responses: [{ text: "Glad to help." }],
      },
      noshare: {
        text: "Share? With who, the Reverend? He's got Maniacs in his cellar. Let's get one garden growing before we save the world. [She hugs the tin.] Thank you. Truly.",
        responses: [{ text: "Fair enough." }],
      },
      thanks: {
        text: "I'll plant the first row tonight. Come back in a few weeks and there'll be corn taller than Doyle. Here — scrip, and all the gnarlberries you can carry. Well. Four.",
        responses: [{ text: "Enjoy the corn." }],
      },
      keep: {
        text: "Then you're holding the last good seeds in New York in your pack, next to your bullets. Think about that. [She turns back to her spuds.]",
        responses: [{ text: "Goodbye." }],
      },
      after: {
        text: () =>
          PF.flag("ft_seeds") === "shared"
            ? "Beans are up at Trinity too — the Reverend sent a thank-you. Well, a hymn. Same thing. What do you need?"
            : "First shoots are up! Corn, look. Tiny, but it's corn. What do you need?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "Just visiting the corn." },
        ],
      },
    },
  });
  function giveSeeds(shared) {
    PF.inv.remove("pf_seed_tin", 1);
    PF.setFlag("ft_seeds", shared ? "shared" : "given");
    PF.standing(shared ? 30 : 15, "Brought old-world seeds to Fraunces Market");
    if (PF.flag("ft_seeds_bonus")) PF.inv.addScrip(50);
    if (shared) PF.xp(75, "Shared the seeds with Trinity Sanctuary");
    PF.q.done("pf_seeds");
  }
  PF.quest({
    id: "pf_seeds",
    name: "Victory Garden",
    giver: "Dilly Nwosu",
    location: "Fraunces Tavern",
    desc: "Dilly Nwosu keeps the garden in the Fraunces Market courtyard alive on spuds and plums. She believes an old-world civil-defense seed reserve was stored in the cold store of the Fulton Fish Market at the South Street Seaport.",
    stages: [
      {
        id: "find",
        text: "Find the seed reserve in the Fulton Fish Market cold store (South Street Seaport).",
        markers: () => {
          const a = PF.anchorOf("seaport", "cold_store");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Cold Store",
                  interior: "seaport",
                },
              ]
            : [{ x: 210, z: 715, label: "Fulton Fish Market" }];
        },
      },
      {
        id: "bring",
        text: "Bring the Victory Garden seed tin to Dilly Nwosu in the Fraunces Market courtyard.",
        markers: () => [{ npc: "pf_ft_dilly", label: "Dilly Nwosu" }],
      },
    ],
    rewards: { xp: 200, scrip: 60, items: [["gnarlberry", 4]] },
  });
  G.events.on("itemAdded", (id) => {
    if (id === "pf_seed_tin" && PF.q.stage("pf_seeds") === "find")
      PF.q.set("pf_seeds", "bring");
  });
  // Items already in the pack when a quest starts (eggs harvested for Lottie, the tin found before meeting Dilly):
  // skip straight to the hand-in stage so the marker points at the giver, not back at the Seaport.
  G.events.on("questStarted", (q) => {
    const id = q && (q.id || q);
    if (id === "pf_shellback_omelette" && PF.inv.count("pf_shellback_egg") >= 5)
      PF.q.advance("pf_shellback_omelette", "eggs", "bring");
    if (id === "pf_seeds" && PF.inv.count("pf_seed_tin") > 0)
      PF.q.advance("pf_seeds", "find", "bring");
  });
  // the tin + its inventory tag sit in the Seaport market's walk-in cold store (the seaport builds after us)
  PF.addBuilder(
    "fraunces_seeds",
    function () {
      const a = PF.anchorOf("seaport", "cold_store");
      if (!a) return;
      PF.pickup("pf_seed_tin", 1, V3(a.x - 0.6, a.y + 0.05, a.z + 1.6));
      PF.pickup("pf_note_seeds", 1, V3(a.x - 0.2, a.y + 0.05, a.z + 1.9));
    },
    45,
  );

  // ===================================================================
  // BUILDER
  // ===================================================================
