// play-inline-426 04 — end
// Lines 1215-1577 of readable/play-inline-426.pretty.js (statement-aligned).
  function data() {
    K.keyFrom(
      "ph2_es_vault_key",
      'Hattie Szabo — "An Honest Weight" (given on accepting)',
    );
    K.defineItem({
      id: "ph2_es_vault_key",
      type: "key",
      name: "Empire Stores Cellar Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A long iron key on a loop of red cord. Hattie Szabo has worn it round her neck for eleven years.",
    });
    K.defineItem({
      id: "ph2_es_goods",
      type: "misc",
      name: "Stolen Market Goods",
      weight: 4,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: "A sack of tagged goods from the Empire Stores cellar: each bundle still wears Hattie's brass weight tag.",
    });
    K.defineItem({
      id: "ph2_es_coffee",
      type: "aid",
      name: "Empire Roast",
      weight: 0.3,
      value: 14,
      tags: ["drink"],
      mesh: "bottle_water",
      sound: "drink",
      effects: { stamina: 20, attrs: { senses: 1 }, duration: 240 },
      desc: 'Roasted "coffee" from the Empire Roastery: chicory, burnt potato, a few real beans from a sealed 1967 sack, and a lot of optimism.',
    });
    K.defineItem({
      id: "ph2_es_scale_weight",
      type: "misc",
      name: "Certified Brass Weight (1 lb)",
      weight: 1,
      value: 60,
      tags: ["valuable", "unique"],
      desc: "A brass pound weight stamped N.Y.C. DEPT. OF WEIGHTS & MEASURES — CERTIFIED 1961. In a world with no honest anything, this is honest.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph2_honest_weight",
        name: "Honest Weight",
        giver: "Hattie Szabo",
        location: "Empire Stores",
        desc: "Goods keep vanishing from the Empire Stores market cellar — and its lock has never been picked. Hattie Szabo wants the thief found before the traders stop trusting her scale.",
        stages: [
          {
            id: "cellar",
            text: "Search the market cellar below the Empire Stores.",
            markers: [
              () => {
                const a = PV.anchor("empire_stores", "cellar");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Market cellar",
                      interior: "empire_stores",
                    }
                  : null;
              },
            ],
          },
          {
            id: "confront",
            text: "Confront Gaffney, the night watchman.",
            markers: [{ npc: "ph2_pike", label: "Gaffney" }],
          },
          {
            id: "report",
            text: "Tell Hattie Szabo what you found.",
            markers: [{ npc: "ph2_hattie", label: "Hattie" }],
          },
        ],
        rewards: { xp: 300 },
      });
    }
    // Stage sync (quest audit): the cache may be found — or Gaffney killed / talked round — before or out of order
    // with Hattie's quest. Bring the stage up to what the player has already done so it can always be finished.
    PV.esSync = function () {
      const q = K.q,
        id = "ph2_honest_weight";
      if (!q.active(id)) return;
      if (q.stage(id) === "cellar" && PV.flag("es_cache"))
        q.set(id, "confront");
      if (
        q.stage(id) === "confront" &&
        (PV.flag("es_pike_dead") || PV.flag("es_pike_confessed"))
      )
        q.set(id, "report");
    };
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q,
      S = PV;
    G.dialogue.register("ph2_dlg_hattie", {
      start: () => {
        if (q.done("ph2_honest_weight"))
          return S.flag("es_cut") ? "fooled" : "after";
        if (q.active("ph2_honest_weight"))
          return q.stage("ph2_honest_weight") === "report" ? "report" : "wait";
        return S.flag("es_met_hattie") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Hattie Szabo",
          onEnter: () => S.setFlag("es_met_hattie", true),
          text: "[A lean grey-haired woman in a leather apron, sleeves rolled, a brass weight on a chain around her neck. She is adjusting the counterpoise of an enormous platform scale.] Welcome to the Empire Stores. Everything that changes hands in this building gets weighed on that scale — certified, 1961, by the City of New York. You want to trade, you trade honest.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Why does weight matter so much?", next: "why" },
            { text: "You look worried.", next: "worry" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Hattie Szabo",
          text: "Scale's balanced. What do you need?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "Anything I can help with?",
              next: "worry",
              cond: () => !q.started("ph2_honest_weight"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        why: {
          speaker: "Hattie Szabo",
          text: "Because scrip is just paper and everybody lies. A pound is a pound. Traders come from Whitehall and the Bronx and the Jersey flats because in this building, a pound of meat is a pound of meat. Take that away and we're just another raider camp with nicer bricks.",
          responses: [{ text: "Makes sense.", next: "again" }],
        },
        worry: {
          speaker: "Hattie Szabo",
          text: "[She lowers her voice.] Things are going missing from the cellar downstairs. Consignments. A crate of Rally Tonic, forty pounds of jerky, a gold wristwatch — somebody's grandfather's watch. The lock's never been touched. Only key is round my neck. If the traders find out the cellar leaks, the scale means nothing.",
          responses: [
            { text: "I'll find your thief.", next: "yes" },
            {
              text: "[Senses 7] Only key's round your neck... or only door is locked?",
              check: { attr: "senses", value: 7 },
              next: "door",
              failNext: "yes",
            },
            { text: "Not my business.", end: true },
          ],
        },
        door: {
          speaker: "Hattie Szabo",
          text: "[She stops.] ...The cellar's an old coffee store. There's drains. Old coal chutes. Huh. Here — take the key. Look at the floor, not the door.",
          responses: [{ text: "On it.", next: "yes" }],
        },
        yes: {
          speaker: "Hattie Szabo",
          learn: "ph2_lk_es_ledger",
          text: "Here. [She lifts the key over her head and holds it out, and doesn't let go right away.] The cellar's down the stairs in the west bay. My ledger in the scale house answers to TOLERANCE, if you want the losses in black and white. Bring me a name. Bring me proof. There's two hundred scrip and my thanks in it — and my thanks weighs more.",
          onEnter: () => {
            if (!K.has("ph2_es_vault_key")) K.give("ph2_es_vault_key", 1);
            q.start("ph2_honest_weight");
            PV.esSync();
          },
          responses: [{ text: "I'll be back.", end: true }],
        },
        wait: {
          speaker: "Hattie Szabo",
          text: "Anything? Don't tell me it's ghosts. I don't charge ghosts rent.",
          responses: [
            { text: "Still looking.", end: true },
            { text: "Let's trade while I'm here.", barter: true, end: true },
          ],
        },
        report: {
          speaker: "Hattie Szabo",
          text: () =>
            S.flag("es_pike_confessed")
              ? "Gaffney told me. Came up here with his hat in his hands and the goods in a sack. Eleven years he's walked these floors for me. [She is quiet a while.] You did right. So did he, in the end."
              : S.flag("es_pike_dead")
                ? "Gaffney. Gaffney, of all people. [She looks at the sack of tagged goods, then away.] I heard the shots. Well. The scale is honest again."
                : "You found it? Show me.",
          responses: [
            {
              text: "Here are your goods.",
              next: "paid",
              cond: () => K.has("ph2_es_goods") || S.flag("es_pike_confessed"),
            },
            {
              text: "Not yet.",
              end: true,
              cond: () =>
                !(K.has("ph2_es_goods") || S.flag("es_pike_confessed")),
            },
          ],
        },
        paid: {
          speaker: "Hattie Szabo",
          text: "Two hundred scrip, as promised. And this — [she unclips one of the brass weights from her chain] — certified, 1961. Anyone in the Ruins asks if you're honest, show them that. And you get the trader's rate in my market from now on.",
          onEnter: () => {
            if (!q.active("ph2_honest_weight")) return;
            if (K.has("ph2_es_goods"))
              K.take("ph2_es_goods", K.has("ph2_es_goods") ? 1 : 0);
            K.scrip(200);
            K.give("ph2_es_scale_weight", 1);
            K.standing(25, "Honest Weight");
            S.setFlag("es_discount", true);
            q.complete("ph2_honest_weight");
          },
          responses: [{ text: "Thanks, Hattie.", end: true }],
        },
        after: {
          speaker: "Hattie Szabo",
          text: "Scale's honest, cellar's dry, and the traders are back. Trader's rate for you, friend.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        fooled: {
          speaker: "Hattie Szabo",
          text: "Whatever it was, it stopped. Ghosts, I suppose. [She doesn't look at you when she says it.]",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    G.dialogue.register("ph2_dlg_pike", {
      start: () => {
        if (S.flag("es_pike_confessed")) return "after";
        if (q.done("ph2_honest_weight") && S.flag("es_cut")) return "hello";
        if (
          (q.active("ph2_honest_weight") &&
            q.stage("ph2_honest_weight") === "confront") ||
          (!q.done("ph2_honest_weight") && K.has("ph2_es_goods"))
        )
          return "caught";
        return "hello";
      },
      nodes: {
        hello: {
          speaker: "Gaffney",
          text: "[A heavyset man in a watchman's coat, lantern at his belt, yawning.] Night watch. Sleep days, walk nights. Walk the cellar, walk the yard, walk the roof. Nothing ever happens. That's the job.",
          responses: [{ text: "Sounds peaceful.", end: true }],
        },
        caught: {
          speaker: "Gaffney",
          text: "[He sees the tagged bundles — or the look on your face — and sits down heavily on his bunk.] ...You found the drain.",
          responses: [
            { text: "Why, Gaffney?", next: "why" },
            {
              text: "[Persuasion 50] Hattie trusts you. Put it back and tell her yourself.",
              check: { skill: "persuasion", value: 50 },
              next: "confess",
              failNext: "confess_fail",
            },
            {
              text: "[Trade 40] Or... you cut me in and I never saw a thing.",
              check: { skill: "trade", value: 40 },
              next: "cut",
              failNext: "cut_fail",
            },
            { text: "Thief. [Attack]", next: "fight" },
          ],
        },
        why: {
          speaker: "Gaffney",
          text: "My girl's in Whitehall. Doc Ferris says her lungs are going — dust, rads, who knows. He's got medicine, real old-world, costs more than I make in a year of walking. So I walked a little further. Down the drain. Just a little each week. Nobody weighs what's already gone.",
          responses: [
            {
              text: "[Persuasion 50] Then tell Hattie. She'd help.",
              check: { skill: "persuasion", value: 50 },
              next: "confess",
              failNext: "confess_fail",
            },
            { text: "That's not my problem.", next: "fight" },
            { text: "I'll think about it.", end: true },
          ],
        },
        confess: {
          speaker: "Gaffney",
          text: "[A long breath.] Yeah. Yeah, she would. That's the worst part. [He stands, takes his hat.] I'll bring it all up. Every pound. You tell her I came on my own feet, alright?",
          onEnter: () => {
            S.setFlag("es_pike_confessed", true);
            K.standing(20, "Gaffney confessed");
            K.xp(100, "Talked Gaffney into confessing");
            if (!q.started("ph2_honest_weight")) q.start("ph2_honest_weight");
            if (q.active("ph2_honest_weight"))
              q.set("ph2_honest_weight", "report");
          },
          responses: [{ text: "I will.", end: true }],
        },
        confess_fail: {
          speaker: "Gaffney",
          text: "Tell her? And lose the job, and the bunk, and the medicine? No. No, I don't think so.",
          responses: [
            { text: "Then I will.", end: true },
            { text: "Wrong answer. [Attack]", next: "fight" },
          ],
        },
        cut: {
          speaker: "Gaffney",
          text: "[He looks at you for a long moment, then digs under the mattress.] Hundred scrip. And you never saw the drain. We never met.",
          onEnter: () => {
            S.setFlag("es_cut", true);
            K.scrip(100);
            K.standing(-30, "Took Gaffney's hush money");
            if (K.has("ph2_es_goods")) K.take("ph2_es_goods", 1);
            if (q.active("ph2_honest_weight")) q.complete("ph2_honest_weight");
          },
          responses: [{ text: "Never met.", end: true }],
        },
        cut_fail: {
          speaker: "Gaffney",
          text: "Cut you in? I'm barely cutting ME in. Get out of my bunk.",
          responses: [{ text: "Fine.", end: true }],
        },
        fight: {
          speaker: "Gaffney",
          text: "Eleven years. Eleven years and nobody ever looked at the floor. [He reaches for his rifle.]",
          onEnter: () => {
            const a = G.actors.get && G.actors.get("ph2_pike");
            if (a && a.setHostile) a.setHostile(true);
          },
          responses: [{ text: "[Fight]", end: true }],
        },
        after: {
          speaker: "Gaffney",
          text: "Hattie docked me half pay and gave my girl the medicine anyway. Out of her own share. [He shakes his head.] Honest weight.",
          responses: [{ text: "Take care, Gaffney.", end: true }],
        },
      },
    });
    G.dialogue.register("ph2_dlg_bean", {
      start: () => "hello",
      nodes: {
        hello: {
          speaker: "Bean Okonkwo",
          text: "[A tall man with a burn-scarred forearm, feeding the roaster drum from a burlap sack. The whole bay smells of scorched chicory.] Welcome to the Empire Roastery. This building held more coffee than anywhere in America once. Now it holds me, and the last forty pounds of real beans in New York. Want a cup?",
          responses: [
            { text: "Pour me one.", barter: true, end: true },
            { text: "Real coffee? Where from?", next: "beans" },
            { text: "Later.", end: true },
          ],
        },
        beans: {
          speaker: "Bean Okonkwo",
          text: "Sealed sacks in the back of the coffee cellar — nitrogen-packed, 1967 stamp, Brazilian. Found 'em behind a false wall the week I got here. I cut every pound with chicory and potato so they last. When the beans run out... [He shrugs.] Then it's potato. Everything is always potato eventually.",
          responses: [{ text: "I'll take a cup.", barter: true, end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
