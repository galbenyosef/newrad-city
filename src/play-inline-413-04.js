// play-inline-413 04 — end
// Lines 899-1447 of readable/play-inline-413.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "pf3_dm_key",
      type: "key",
      name: "Delmonico's Cold Storage Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A brass key on a butcher's-twine loop. The tag reads COLD STORAGE — STAFF ONLY — NO GUESTS.",
    });
    K.defineItem({
      id: "pf3_dm_steak",
      type: "aid",
      name: "Delmonico Steak (Chef's Special)",
      weight: 0.5,
      value: 60,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 60, duration: 300, attrs: { grit: 1 } },
      desc: "A thick, perfectly marbled cut, pan-seared, finished with butter. It is not ox. You know it is not ox.",
    });
    K.defineItem({
      id: "pf3_dm_newberg",
      type: "aid",
      name: "Lobster Newberg (Shellback)",
      weight: 0.5,
      value: 25,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 30, stamina: 10 },
      desc: "Invented here in 1876, allegedly. The lobster is a shellback. The sherry is real.",
    });
    K.defineItem({
      id: "pf3_dm_alaska",
      type: "aid",
      name: "Baked Alaska",
      weight: 0.5,
      value: 30,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 15, stamina: 25 },
      desc: "Meringue, cake and something frozen, flambéed at the table by a robot. Named for the purchase of Alaska, and kept on the menu through every war since.",
    });
    K.defineItem({
      id: "pf3_dm_benedict",
      type: "aid",
      name: "Eggs Benedict",
      weight: 0.4,
      value: 18,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 25 },
      desc: "Poached eggs (stinger), ham (mystery), hollandaise (miraculous). Another Delmonico's invention.",
    });
    K.defineItem({
      id: "pf3_dm_ring",
      type: "misc",
      name: "Gilded Fork Signet Ring",
      weight: 0,
      value: 300,
      tags: ["valuable", "unique"],
      desc: 'Heavy gold, engraved with a fork crossed over a knife and the motto OMNES EDUNT — "everyone eats." Members wear it on the right hand, so that it shows when they cut.',
    });
    K.defineItem({
      id: "pf3_dm_penny",
      type: "misc",
      name: "Walt's Lucky Penny",
      weight: 0,
      value: 5,
      tags: ["unique"],
      desc: "A 1943 steel penny, drilled and threaded on a string. Walt says it saved his life once. Mae says it did it twice.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pf3_taste",
        name: "An Acquired Taste",
        giver: "Mae Tully",
        location: "Delmonico's",
        desc: "Mae Tully's husband Walt took a dishwasher job at Delmonico's, the fine-dining club on Beaver Street. That was two weeks ago.",
        stages: [
          {
            id: "find",
            text: "Look for Walt Tully at Delmonico's.",
            markers: [{ npc: "pf3_lorenzo", label: "Maître d'" }],
          },
          {
            id: "cellar",
            text: "Find out what is behind the kitchen's cold-storage door.",
            markers: [
              () => {
                const a = PV.anchor("delmonicos", "coldstore");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Cold Storage",
                      interior: "delmonicos",
                    }
                  : null;
              },
            ],
          },
          {
            id: "free",
            text: "Get Walt out of the larder.",
            markers: [{ npc: "pf3_walt", label: "Walt" }],
          },
          {
            id: "return",
            text: "Tell Mae that Walt is safe.",
            markers: [{ npc: "pf3_mae", label: "Mae" }],
          },
        ],
        rewards: { xp: 300 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const S = PV;
    const toCellar = () => {
      if (q.active("pf3_taste") && q.stage("pf3_taste") === "find")
        q.set("pf3_taste", "cellar");
    };
    G.dialogue.register("pf3_dlg_mae", {
      start: () => {
        if (S.flag("dm_walt_free") && q.active("pf3_taste")) return "reunion";
        if (q.done("pf3_taste"))
          return S.flag("dm_walt_eaten") ? "widow" : "after";
        if (q.active("pf3_taste")) return "again";
        return "hello";
      },
      nodes: {
        hello: {
          speaker: "Mae Tully",
          text: '[A thin woman in a patched coat, watching the portico like it might bite.] Excuse me — you look like you can take care of yourself. My husband Walt took the dishwasher job in there. "HELP WANTED." Two weeks ago. He said they pay in real food. He hasn\'t come home.',
          responses: [
            {
              text: "I'll go in and look for him.",
              next: "yes",
              action: () => q.start("pf3_taste"),
            },
            { text: "Maybe he just likes the job.", next: "likes" },
            { text: "Why don't you go in yourself?", next: "why" },
            { text: "Not my problem.", end: true },
          ],
        },
        likes: {
          speaker: "Mae Tully",
          text: "Walt? Walt has never liked a job in his life. He liked me, and his lucky penny, and sleeping in. He'd have come home.",
          responses: [
            {
              text: "I'll look for him.",
              next: "yes",
              action: () => q.start("pf3_taste"),
            },
            { text: "Sorry.", end: true },
          ],
        },
        why: {
          speaker: "Mae Tully",
          text: 'I did. The robot at the door said "members and guests only, madam," and the man with the tiny moustache looked at me like — like he was measuring me. For a coat. Or something.',
          responses: [
            {
              text: "I'll go in.",
              next: "yes",
              action: () => q.start("pf3_taste"),
            },
            { text: "Sorry.", end: true },
          ],
        },
        yes: {
          speaker: "Mae Tully",
          text: "Thank you. He's a big lug, red beard, sings when he washes. If he's in there, you'll hear him. If you don't hear him... [She stops.] Just find him.",
          responses: [{ text: "I will.", end: true }],
        },
        again: {
          speaker: "Mae Tully",
          text: "Anything? Did you see him? Did you hear him singing?",
          responses: [{ text: "Still looking.", end: true }],
        },
        reunion: {
          speaker: "Mae Tully",
          text: () =>
            "[Walt is here — filthy, shaking, alive. Mae has her arms around him and isn't letting go.] You found him. They had him in a CAGE? In a — oh god, those people. Those PEOPLE. Here — it's all we have. And his lucky penny. He wants you to have it. Says his luck's used up; you'll need it more.",
          onEnter: () => {
            if (q.active("pf3_taste")) {
              K.scrip(80);
              K.give("pf3_dm_penny", 1);
              K.give("rally_tonic", 2);
              K.standing(50, "Rescued Walt Tully");
              q.complete("pf3_taste");
            }
          },
          responses: [{ text: "Get him somewhere safe.", end: true }],
        },
        after: {
          speaker: "Mae Tully",
          text: () =>
            S.flag("dm_reformed")
              ? "They're serving ox now, I hear. I still won't eat there. Walt says the hollandaise was good, though. I hit him."
              : "Walt still wakes up screaming. But he wakes up. Thank you.",
          responses: [{ text: "Take care, Mae.", end: true }],
        },
        widow: {
          speaker: "Mae Tully",
          text: "Still no word. I'll wait. Somebody has to wait.",
          responses: [
            { text: "[Say nothing]", end: true },
            { text: "He's not coming back, Mae.", end: true, standing: 5 },
          ],
        },
      },
    });
    G.dialogue.register("pf3_dlg_lorenzo", {
      start: () => {
        if (S.flag("dm_reformed")) return "reformed";
        if (S.flag("dm_member")) return "member";
        if (S.flag("dm_walt_free") || S.flag("dm_seen_larder")) return "knows";
        return S.flag("dm_met_lorenzo") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Lorenzo Delmonico",
          onEnter: () => S.setFlag("dm_met_lorenzo", true),
          text: "Good evening, and welcome to Delmonico's — New York's first restaurant, since 1837, and, one might argue, its last. I am Lorenzo Delmonico, seventh of the name. Do you have a reservation?",
          responses: [
            {
              text: "I'm looking for a man named Walt Tully.",
              next: "walt",
              cond: () => q.active("pf3_taste"),
            },
            { text: "I'm hungry. What's on the menu?", next: "menu" },
            { text: "What is this place?", next: "history" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Lorenzo Delmonico",
          text: "Back again. The kitchen is at your disposal — within reason. Everything is within reason at Delmonico's.",
          responses: [
            { text: "Let's see the menu.", barter: true, end: true },
            {
              text: "About Walt Tully.",
              next: "walt",
              cond: () =>
                q.active("pf3_taste") && q.stage("pf3_taste") === "find",
            },
            { text: "Tell me about the Society.", next: "society" },
            { text: "Goodbye.", end: true },
          ],
        },
        menu: {
          speaker: "Lorenzo Delmonico",
          text: "Everything you know was invented here. The Delmonico steak. Lobster Newberg. Eggs Benedict. Baked Alaska. We still serve them all — adapted, shall we say, to local ingredients. The Chef's Special is reserved for members.",
          responses: [
            { text: "Show me what you have.", barter: true, end: true },
            { text: "Members?", next: "society" },
          ],
        },
        history: {
          speaker: "Lorenzo Delmonico",
          text: "The Delmonico brothers opened the first true restaurant in America on this corner — a menu! Tablecloths! Choice! — and fed presidents, robber barons and Charles Dickens. When the bombs fell, the members of the Gilded Fork Society were at their Sunday brunch. They simply... never left. We have kept up standards. Someone must.",
          responses: [
            { text: "The Gilded Fork Society?", next: "society" },
            { text: "Goodbye.", end: true },
          ],
        },
        society: {
          speaker: "Lorenzo Delmonico",
          text: "A dining club. Old families — old money, when money meant anything. They believe civilisation is simply the refusal to eat with one's hands. Membership is by invitation. And by... appetite.",
          responses: [
            { text: "Appetite for what?", next: "appetite" },
            { text: "Goodbye.", end: true },
          ],
        },
        appetite: {
          speaker: "Lorenzo Delmonico",
          text: "[His smile does not move.] For the finer things.",
          responses: [{ text: "Right.", end: true }],
        },
        walt: {
          speaker: "Lorenzo Delmonico",
          onEnter: toCellar,
          text: "Mr. Tully. Our dishwasher. He... resigned. Most of our staff resign, eventually. Chef Bastien handled his severance. Is there anything else? The Colonel's soup is getting cold.",
          responses: [
            {
              text: "[Senses 6] Your eyes just went to the kitchen door.",
              check: { attr: "senses", value: 6 },
              next: "tell",
              failNext: "tell_fail",
            },
            { text: "I'll ask the Chef.", end: true },
          ],
        },
        tell: {
          speaker: "Lorenzo Delmonico",
          text: "[A long pause.] The kitchen is staff only, and the cold storage beneath it doubly so. The Chef keeps the key. I am sure there is nothing down there to interest a guest.",
          responses: [{ text: "I'm sure.", end: true }],
        },
        tell_fail: {
          speaker: "Lorenzo Delmonico",
          text: "Good evening.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        knows: {
          speaker: "Lorenzo Delmonico",
          text: "[He folds his hands.] You have been below stairs. I can see it in how you look at the tables. Well. What happens now is a matter of taste.",
          responses: [
            {
              text: "[Persuasion 70] This ends tonight. Serve ox, or the whole city hears what you serve instead.",
              check: { skill: "persuasion", value: 70 },
              next: "reform",
              failNext: "reform_fail",
            },
            {
              text: "[Trade 50] Silence is expensive. How much is mine worth?",
              check: { skill: "trade", value: 50 },
              next: "hush",
              failNext: "hush_fail",
              cond: () => !S.flag("dm_hush"),
            },
            { text: "You're all monsters. [Attack]", next: "fight" },
            { text: "Nothing. For now.", end: true },
          ],
        },
        reform: {
          speaker: "Lorenzo Delmonico",
          text: "[He looks out over the dining room for a long time. At the Colonel. At the Judge. At the empty chair.] ...Very well. A hundred and fifty years, we adapted to every fashion. We shall adapt to one more. Ox Wellington, from tomorrow. The members will complain. The members always complain.",
          onEnter: () => {
            S.setFlag("dm_reformed", true);
            K.standing(40, "Reformed the Gilded Fork Society");
            K.xp(200, "An Acquired Taste: the menu changes");
            if (
              q.active("pf3_taste") &&
              !S.flag("dm_walt_free") &&
              !S.flag("dm_walt_eaten")
            )
              q.set("pf3_taste", "free");
          },
          responses: [{ text: "See that they do.", end: true }],
        },
        reform_fail: {
          speaker: "Lorenzo Delmonico",
          text: "The city? My dear guest, the Ruins eat whatever they can catch. We simply use cutlery.",
          responses: [
            { text: "Then I'll deal with you myself. [Attack]", next: "fight" },
            { text: "We'll see.", end: true },
          ],
        },
        hush: {
          speaker: "Lorenzo Delmonico",
          onEnter: () => {
            S.setFlag("dm_hush", true);
            K.scrip(300);
            K.standing(-40, "Took the Society's hush money");
          },
          text: "Three hundred scrip, and a standing table. [He counts it out without looking.] A pleasure doing business with a realist.",
          responses: [{ text: "Pleasure's mine.", end: true }],
        },
        hush_fail: {
          speaker: "Lorenzo Delmonico",
          text: "Worth? Very little, I'm afraid. People go missing every day. The ones who talk go missing faster.",
          responses: [{ text: "...", end: true }],
        },
        fight: {
          speaker: "Lorenzo Delmonico",
          text: "How terribly rude. — Gentlemen. Dessert.",
          onEnter: () => PV.dmHostile && PV.dmHostile(),
          responses: [{ text: "[Fight]", end: true }],
        },
        member: {
          speaker: "Lorenzo Delmonico",
          text: "Your table is ready, as always. The Chef has something special.",
          responses: [
            { text: "Let's see the menu.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        reformed: {
          speaker: "Lorenzo Delmonico",
          text: "Ox Wellington tonight. It is... adequate. The Colonel wept. Welcome back.",
          responses: [
            { text: "Let's see the menu.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    G.dialogue.register("pf3_dlg_anton", {
      start: () =>
        S.flag("dm_member")
          ? "member"
          : S.flag("dm_reformed")
            ? "reformed"
            : S.flag("dm_seen_larder") && !S.flag("dm_walt_free")
              ? "deal"
              : "hello",
      nodes: {
        hello: {
          speaker: "Chef Bastien",
          text: "[A tall man in spotless whites, sharpening a knife that is already sharp.] Guests do not come into my kitchen. You are in my kitchen. So either you are lost, or you are staff, or you are an ingredient. Which?",
          responses: [
            {
              text: "Where's Walt Tully?",
              next: "walt",
              cond: () => q.active("pf3_taste"),
            },
            { text: "What's in cold storage?", next: "cold" },
            {
              text: "[Persuasion 60] Mr. Delmonico sent me for the cold-storage key. Inventory.",
              check: { skill: "persuasion", value: 60 },
              next: "key",
              failNext: "key_fail",
              cond: () => !K.has("pf3_dm_key"),
            },
            { text: "Just lost.", end: true },
          ],
        },
        walt: {
          speaker: "Chef Bastien",
          onEnter: () => {
            if (q.active("pf3_taste") && q.stage("pf3_taste") === "find")
              q.set("pf3_taste", "cellar");
          },
          text: "The dishwasher. Big fellow. Sang. [He tests the edge on his thumbnail.] He is... resting. In cold storage. Stacking inventory.",
          responses: [{ text: "Then I'll go say hello.", next: "cold" }],
        },
        cold: {
          speaker: "Chef Bastien",
          text: "Cold storage is locked, the key is on my belt, and my belt is on me. Hock is down there, and Hock does not like visitors. Good night.",
          responses: [{ text: "Good night.", end: true }],
        },
        key: {
          speaker: "Chef Bastien",
          onEnter: () => K.give("pf3_dm_key", 1),
          text: "Inventory. Of course. [He unhooks the key without looking at you.] Tell Hock the Colonel wants the rib. He'll know.",
          responses: [{ text: "Will do.", end: true }],
        },
        key_fail: {
          speaker: "Chef Bastien",
          text: "Mr. Delmonico has never sent anyone for anything. He rings a bell. Out.",
          responses: [{ text: "Going.", end: true }],
        },
        deal: {
          speaker: "Chef Bastien",
          text: "[He sets the knife down, which is somehow worse.] So. You have seen my larder. Let me offer you a perspective, friend. Everyone in the Ruins eats. The only question anyone has ever asked is: who is at the table, and who is on it. You could be at the table.",
          responses: [
            { text: "I'm listening.", next: "offer" },
            { text: "I'm getting Walt out of there.", next: "no" },
          ],
        },
        offer: {
          speaker: "Chef Bastien",
          text: "Membership. A ring, a seat, three hundred scrip from the Society's purse — and tonight's special, which is, of course, Mr. Tully. You keep your mouth shut. You eat. You become one of us. The Ruins will never feed you so well again.",
          responses: [
            {
              text: "[Join the Gilded Fork Society] ...Pass the salt.",
              next: "join",
            },
            { text: "No. Walt's coming with me.", next: "no" },
          ],
        },
        join: {
          speaker: "Chef Bastien",
          text: "[He smiles for the first time. It is a very good smile.] Welcome to the table. Omnes edunt — everyone eats. Your ring. Your scrip. And — [the silver cloche comes up] — your supper.",
          onEnter: () => {
            S.setFlag("dm_member", true);
            S.setFlag("dm_walt_eaten", true);
            K.give("pf3_dm_ring", 1);
            K.scrip(300);
            K.give("pf3_dm_steak", 2);
            K.standing(-150, "Joined the Gilded Fork Society");
            K.safe("walt", () => {
              const w = G.actors.get && G.actors.get("pf3_walt");
              if (w && G.actors.remove) G.actors.remove(w);
            });
            if (q.active("pf3_taste")) q.complete("pf3_taste");
          },
          responses: [{ text: "[Eat]", end: true }],
        },
        no: {
          speaker: "Chef Bastien",
          text: "Pity. Hock! — We have a guest who wants to see the larder.",
          onEnter: () => PV.dmHockHostile && PV.dmHockHostile(),
          responses: [{ text: "[Leave]", end: true }],
        },
        member: {
          speaker: "Chef Bastien",
          text: "Brother. The rib is especially good tonight.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        reformed: {
          speaker: "Chef Bastien",
          text: "Ox. OX! A hundred and fifty years of tradition and I am cooking a draught animal. [He cooks it anyway, beautifully.]",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pf3_dlg_walt", {
      start: () => (S.flag("dm_cage_open") ? "open" : "caged"),
      nodes: {
        caged: {
          speaker: "Walt Tully",
          text: "[A big red-bearded man in a filthy apron, gripping the bars.] You're — you're not Hock. Oh thank God. Please. Did Mae send you? They've been... they took Hector on Tuesday. They took the Portuguese kid before that. They weigh me every morning.",
          responses: [
            {
              text: "Mae sent me. Hold on — I'll get this cage open.",
              next: "hold",
              action: () => {
                if (K.q.active("pf3_taste")) K.q.set("pf3_taste", "free");
              },
            },
            { text: "Where's the key?", next: "key" },
          ],
        },
        key: {
          speaker: "Walt Tully",
          learn: "pf3_lk_dm_cage",
          text: "Hock's got one. The Chef's got one. And the padlock's got a dial on it too — Hock spins it every morning before he weighs me. Four... two... one... nine. I've had a lot of time to watch. Just hurry. He comes down at supper.",
          responses: [{ text: "Hold on.", end: true }],
        },
        hold: {
          speaker: "Walt Tully",
          text: "Hurry. Please.",
          responses: [{ text: "Hang on.", end: true }],
        },
        open: {
          speaker: "Walt Tully",
          text: "It's open — it's OPEN. I know the back way: the service stairs come up by the staff entrance. I'll find Mae. [He grips your hand in both of his.] I won't forget this. Not ever.",
          responses: [
            {
              text: "Go. Now.",
              end: true,
              action: () => PV.dmFreeWalt && PV.dmFreeWalt(),
            },
          ],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
