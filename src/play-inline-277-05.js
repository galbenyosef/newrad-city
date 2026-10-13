// play-inline-277 05 — responses
// Lines 650-1098 of readable/play-inline-277.pretty.js (statement-aligned).
  function defineDialogue() {
    if (G.isStub("dialogue") || typeof G.dialogue.register !== "function")
      return;
    const R = (id, tree) =>
      P.safe("dlg:" + id, () => G.dialogue.register(id, tree));
    // ---------------- Adeline Crandall ----------------
    R("dlg_uw_adeline", {
      start: () =>
        qDone("uw_gardens")
          ? "after"
          : qActive("uw_gardens")
            ? has("uw_seed_bank")
              ? "deliver"
              : "progress"
            : F.adelineMet
              ? "again"
              : "first",
      nodes: {
        first: {
          speaker: "Adeline Crandall",
          text: "You came up in the elevator, so Augie liked you, and you haven't shot anyone, so Birdie likes you. That's two votes. I'm Adeline Crandall. I run the commune, which mostly means I count beans. Or I would, if we had any beans.",
          onEnter: () => {
            F.adelineMet = true;
          },
          responses: [
            { text: "What is this place?", next: "place" },
            { text: "No beans?", next: "beans" },
            { text: "I'll leave you to your counting.", end: true },
          ],
        },
        again: {
          speaker: "Adeline Crandall",
          text: "Back again. Did you bring beans? No? Then sit, have some pigeon, and let me tell you about beans.",
          responses: [
            { text: "Tell me about the beans.", next: "beans" },
            { text: "What is this place?", next: "place" },
            { text: "Later.", end: true },
          ],
        },
        place: {
          speaker: "Adeline Crandall",
          text: "The San Remo. Twin towers, twenty-seven floors, the finest address on Central Park West, and for the last twenty years, the only building on the West Side where nobody eats anybody. Thirty-one of us. A generator, an elevator, a doctor, a trader, and a sniper. Civilisation, more or less.",
          responses: [{ text: "And the beans?", next: "beans" }],
        },
        beans: {
          speaker: "Adeline Crandall",
          text: "We have a conservatory with eight hours of sun, soil we hauled up from the park bucket by bucket, and clean water. What we don't have is seed. Everything that grows out there is irradiated, poisonous, or trying to eat you. But there's a story every West-Sider knows...",
          responses: [{ text: "Go on.", next: "story" }],
        },
        story: {
          speaker: "Adeline Crandall",
          text: "The Ansonia, down Broadway. Before the war an eccentric named Stokes put a farm on the roof — and a seed bank. Heirloom seed, sealed in steel, meant to last three hundred years. The building's full of Maniacs now, and people say old Stokes is still up on the roof, howling at the moon. Bring me that seed bank and this commune stops living on pigeons.",
          responses: [
            {
              text: "I'll get your seeds.",
              next: "accept",
              action: () => qSet("uw_gardens", "seeds"),
            },
            {
              text: "[Trade 35] Pigeons are cheap. Seeds aren't. What's it worth?",
              check: { skill: "trade", value: 35 },
              next: "pay",
              failNext: "payFail",
            },
            { text: "Not my problem.", end: true },
          ],
        },
        pay: {
          speaker: "Adeline Crandall",
          text: "Mercer would be proud of you. Fine: two hundred and fifty scrip from the commune fund, and a bed here any night you want it. That's everything we have that isn't nailed down, and most of what is.",
          onEnter: () => {
            F.bonus = true;
          },
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => qSet("uw_gardens", "seeds"),
            },
          ],
        },
        payFail: {
          speaker: "Adeline Crandall",
          text: "It's worth the gratitude of thirty-one hungry people and whatever the fund can spare. Take it or leave it — but take it.",
          responses: [
            {
              text: "All right. I'll go.",
              next: "accept",
              action: () => qSet("uw_gardens", "seeds"),
            },
          ],
        },
        accept: {
          speaker: "Adeline Crandall",
          text: "Thank you. The Ansonia's the Beaux-Arts pile with the green domes, south of here on the park side. The roof door is at the top of the big spiral staircase. And whatever glows up there — don't let it hug you.",
          responses: [{ text: "On my way.", end: true }],
        },
        progress: {
          speaker: "Adeline Crandall",
          text: "Any luck at the Ansonia? The seed bank should be in the roof greenhouse. Stokes kept the key on him, if the stories are right. Stokes also died twenty-two years ago, so the stories may be flexible.",
          responses: [{ text: "I'm working on it.", end: true }],
        },
        deliver: {
          speaker: "Adeline Crandall",
          text: 'Is that — oh. Oh, look at the vials. "Brandywine." "Cherokee bean." "Ansonia Greens"... I don\'t even know what those are. I\'m going to find out. Nia! NIA! Get the trowels!',
          responses: [
            {
              text: "It's all yours.",
              next: "thanks",
              action: () => C.deliverSeeds(),
            },
          ],
        },
        thanks: {
          speaker: "Adeline Crandall",
          text: () =>
            "We'll have the first greens in a month. You'll eat at our table any time you like — and here" +
            (F.bonus
              ? ", the scrip I promised, every one"
              : ", something for the road") +
            ". The San Remo remembers its friends.",
          responses: [{ text: "Grow something good.", end: true }],
        },
        after: {
          speaker: "Adeline Crandall",
          text: () =>
            F.planted
              ? "Go and look at the conservatory. Go on. I'll wait. ...Green! Actual green! I cried. Don't tell Birdie."
              : "The seeds are in. Now we wait, and water, and shoo pigeons.",
          responses: [{ text: "Take care, Adeline.", end: true }],
        },
      },
    });
    // ---------------- Birdie ----------------
    R("dlg_uw_birdie", {
      start: () =>
        qDone("uw_window")
          ? "after"
          : qStage("uw_window") === "report"
            ? "report"
            : qActive("uw_window")
              ? "progress"
              : F.birdieMet
                ? "again"
                : "first",
      nodes: {
        first: {
          speaker: "Birdie",
          text: "Don't move so fast up here, it's a long way down and I'm jumpy. I had you in my scope since Seventy-Second Street. You walk like somebody who's never been shot at from above. You'll learn.",
          onEnter: () => {
            F.birdieMet = true;
          },
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "Quite a view.", next: "view" },
            { text: "I'll leave you to it.", end: true },
          ],
        },
        again: {
          speaker: "Birdie",
          text: "You again. Keep low. What do you want?",
          responses: [
            { text: "Anything I can do?", next: "toby" },
            { text: "Quite a view.", next: "view" },
            { text: "Nothing.", end: true },
          ],
        },
        who: {
          speaker: "Birdie",
          text: "Birdie Finch. The commune's long gun. Raiders come up Central Park West, I send them back down it. Somebody's got to sit up here with the pigeons, and the pigeons are terrible shots.",
          responses: [{ text: "Seems quiet today.", next: "toby" }],
        },
        view: {
          speaker: "Birdie",
          text: "Best in the city. The whole park, the reservoir, midtown burning politely. And down there on Lexington — see the big \"B\" in the black circle? Bellamy's. That's where the Mannequins live.",
          responses: [{ text: "The Mannequins?", next: "toby" }],
        },
        toby: {
          speaker: "Birdie",
          text: "Raiders. They wear plastic faces and dress the dead up in the store windows. Three days ago they took my brother Toby. He went down to Lexington for a winter coat — a WINTER COAT — and they dragged him inside. I can't leave this tower. If I go, the commune's got no teeth.",
          responses: [
            {
              text: "I'll bring your brother back.",
              next: "accept",
              action: () => qSet("uw_window", "find"),
            },
            {
              text: "[Persuasion 40] What makes you think he's still alive?",
              check: { skill: "persuasion", value: 40 },
              next: "alive",
              failNext: "aliveFail",
            },
            { text: "Sorry. Not my fight.", end: true },
          ],
        },
        alive: {
          speaker: "Birdie",
          text: "Because I watch that building every night through this scope, and every night the lights go on in the third floor stockroom, and every night somebody in there bangs on metal. Three bangs, pause, three bangs. That's our signal. That's Toby.",
          responses: [
            {
              text: "Then I'll get him out.",
              next: "accept",
              action: () => qSet("uw_window", "find"),
            },
          ],
        },
        aliveFail: {
          speaker: "Birdie",
          text: "Because he has to be. Are you going to help or are you going to stand on my tower asking stupid questions?",
          responses: [
            {
              text: "I'll help.",
              next: "accept",
              action: () => qSet("uw_window", "find"),
            },
            { text: "Neither.", end: true },
          ],
        },
        accept: {
          speaker: "Birdie",
          text: "Bellamy's, Lexington at Fifty-Ninth. Main doors on Fifty-Ninth. He'll be up top — third floor, back of the store. Their boss calls himself the Window Dresser. Put him in a window for me. And... bring Toby home. Please.",
          responses: [{ text: "Count on it.", end: true }],
        },
        progress: {
          speaker: "Birdie",
          text: () =>
            F.tobyFreed
              ? "I saw the lights change in the stockroom. Is he out? Is he coming?"
              : "Third floor, back of Bellamy's. Three bangs, pause, three bangs. Go.",
          responses: [{ text: "Working on it.", end: true }],
        },
        report: {
          speaker: "Birdie",
          text: "He's home. He came up the elevator an hour ago, skinny as a rake and complaining about the coat he never got. I... here. My father's rifle. I've got the commune's gun; you take the family one. It shoots straighter than I do, and that's saying something.",
          responses: [
            {
              text: "Thank you, Birdie.",
              next: "thanks",
              action: () => C.finishWindow(),
            },
          ],
        },
        thanks: {
          speaker: "Birdie",
          text: "Don't thank me. Just keep your head down when you walk up Central Park West. I'll be watching your back from up here.",
          responses: [{ text: "See you around.", end: true }],
        },
        after: {
          speaker: "Birdie",
          text: "All quiet. Toby's learning to shoot. God help the pigeons.",
          responses: [{ text: "Stay sharp.", end: true }],
        },
      },
    });
    // ---------------- Toby ----------------
    R("dlg_uw_toby", {
      start: () => (F.tobyHome ? "home" : F.cageOpen ? "freed" : "caged"),
      nodes: {
        caged: {
          speaker: "Toby Finch",
          text: "You're not wearing a face. You're not one of them. Please — the lock, the lock. He keeps the key on his belt, the one on the throne. Or there's a switch in the manager's office, I heard them laugh about it. Please.",
          onEnter: () => {
            if (!qActive("uw_window") && !qDone("uw_window"))
              qSet("uw_window", "free");
            else if (qStage("uw_window") === "find") qSet("uw_window", "free");
          },
          responses: [
            { text: "Hang on. I'll get you out.", end: true },
            { text: "Who are you?", next: "who" },
          ],
        },
        who: {
          speaker: "Toby Finch",
          text: "Toby. Toby Finch, from the San Remo. My sister's Birdie — the sniper? I came for a coat. There were coats. There were also raiders. I should have gone to Sterling's.",
          responses: [{ text: "I'll get you out.", end: true }],
        },
        freed: {
          speaker: "Toby Finch",
          text: "It's open! It's — you did it. I know the back way, the freight stair, I watched them use it. I'm going home. Tell Birdie... no. I'll tell her myself.",
          responses: [
            {
              text: "Go. Stay low.",
              end: true,
              action: () => C.sendTobyHome(),
            },
          ],
        },
        home: {
          speaker: "Toby Finch",
          text: "Birdie hugged me so hard I think she cracked a rib. Worth it. I owe you. Also I still don't have a coat.",
          responses: [{ text: "Glad you're home.", end: true }],
        },
      },
    });
    // ---------------- Mercer (trader) ----------------
    R("dlg_uw_mercer", {
      start: "first",
      nodes: {
        first: {
          speaker: "Mercer",
          text: "Mercer's Emporium, formerly the Rosenthal Library, formerly books. Now: ammunition, water, pills, and anything with a resale value. I buy what you find and I sell what you need at a price that keeps the commune's generator running. Browse.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Heard any rumours?", next: "rumours" },
            { text: "Goodbye.", end: true },
          ],
        },
        rumours: {
          speaker: "Mercer",
          text: "Rumours cost extra. Kidding. Mostly. One: the Mannequins at Bellamy's have a boss who used to work there — before. Twenty-two years in the same job, and I thought my career was stuck. Two: the Ansonia's Baths glow in the dark; bring Prussian Blue. Three: the Dakota up the road sings at night. I don't go to the Dakota.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Thanks.", end: true },
          ],
        },
      },
    });
    // ---------------- Doc Halloway ----------------
    const healCost = 40,
      radCost = 70;
    R("dlg_uw_doc", {
      start: "first",
      nodes: {
        first: {
          speaker: "Doc Halloway",
          text: 'Sit, sit. Name\'s Halloway. I was a veterinarian\'s great-great-granddaughter and in this city that makes me a surgeon. What hurts? Don\'t say "everything". Everybody says "everything".',
          responses: [
            {
              text: "Patch me up. [" + healCost + " scrip]",
              next: "healed",
              cond: () => G.player && G.player.hp < G.player.maxHp,
              action: () => {
                if (pay(healCost)) {
                  G.player.heal(G.player.maxHp);
                  F.healed++;
                  sfx("inject");
                }
              },
            },
            {
              text: "Flush the radiation out. [" + radCost + " scrip]",
              next: "flushed",
              cond: () => G.player && G.player.rads > 0,
              action: () => {
                if (pay(radCost)) {
                  G.player.addRads(-1000);
                  sfx("iodine_tabs");
                }
              },
            },
            { text: "I'd like to buy supplies.", barter: true, end: true },
            { text: "I'm fine.", end: true },
          ],
        },
        healed: {
          speaker: "Doc Halloway",
          text: "There. Stitches, a tonic, and a lollipop I found in '71. Try not to get shot in the same place twice, it confuses the stitches.",
          responses: [{ text: "Thanks, Doc.", end: true }],
        },
        flushed: {
          speaker: "Doc Halloway",
          text: "That'll make you pee like a racehorse and glow a little less. Stay out of the Ansonia's Baths. Nobody listens. Stay out anyway.",
          responses: [{ text: "Thanks, Doc.", end: true }],
        },
      },
    });
    // ---------------- Augie (doorman) ----------------
    R("dlg_uw_gus", {
      start: () => (F.gusTalks++ > 0 ? "again" : "first"),
      nodes: {
        first: {
          speaker: "Augie",
          text: "Good evening. Welcome to the San Remo. I've been the doorman here since March the fifth, nineteen sixty-seven, one of the busier days on the job. The elevator's behind me. Guns holstered below fifteen, please. Wipe your feet.",
          responses: [
            { text: "Since 1967? That's twenty-two years.", next: "tenure" },
            { text: "Who lives here?", next: "who" },
            { text: "Thanks, Augie.", end: true },
          ],
        },
        again: {
          speaker: "Augie",
          text: "Evening. The elevator's working. Mostly. Hold the rail.",
          responses: [
            { text: "Who lives here?", next: "who" },
            { text: "Thanks.", end: true },
          ],
        },
        tenure: {
          speaker: "Augie",
          text: "Doormen don't retire, sir. We just get less attractive. I was forty and handsome that morning; I'm sixty-two and distinguished. The residents went down to the shelters and never came up. I kept the door. The commune moved in twenty years ago and asked if they could stay. I said they'd need references. They had none. I let them in anyway. Don't tell anyone.",
          responses: [{ text: "Your secret's safe.", end: true }],
        },
        who: {
          speaker: "Augie",
          text: "Miss Crandall runs things upstairs, in the office off the great room. Mercer trades in the old library. Doc Halloway keeps the clinic. And Miss Finch is on the north tower with the rifle — you'll hear her before you see her. Or you won't hear her, and that's worse.",
          responses: [{ text: "Got it.", end: true }],
        },
      },
    });
    // ---------------- Nia (gardener) + commune settlers ----------------
    R("dlg_uw_nia", {
      start: () => (F.planted ? "green" : "first"),
      nodes: {
        first: {
          speaker: "Nia",
          text: "Mind the beds. They're empty, but they're MY empty beds. Soil from Sheep Meadow, carried up twenty-seven floors a bucket at a time. Now all we need is something to put in it. Adeline says there's seed on the Ansonia roof. Adeline says a lot of things.",
          responses: [{ text: "I'll keep an eye out.", end: true }],
        },
        green: {
          speaker: "Nia",
          text: 'Look at them. LOOK at them. Bean sprouts, tomato starts, and whatever "Ansonia Greens" are — they grow like they\'re angry. Here, take a handful. First harvest goes to the one who fetched the seeds.',
          onEnter: () => {
            if (!F.niaGift) {
              F.niaGift = true;
              give("uw_greens", 3);
            }
          },
          responses: [{ text: "Thanks, Nia.", end: true }],
        },
      },
    });
    R("dlg_uw_settler", {
      start: () => ["a", "b", "c"][Math.floor(Math.random() * 3)],
      nodes: {
        a: {
          speaker: "Commune Settler",
          text: "Dinner's at eight. It's pigeon. Breakfast is also pigeon. There are rumours of beans.",
          responses: [{ text: "Enjoy.", end: true }],
        },
        b: {
          speaker: "Commune Settler",
          text: "Don't ride the elevator with Dennis. He hums.",
          responses: [{ text: "Noted.", end: true }],
        },
        c: {
          speaker: "Commune Settler",
          text: () =>
            F.tobyHome
              ? "You're the one who brought Toby home! Birdie hasn't missed a shot since. Not that she used to."
              : "Poor Birdie. She hasn't slept since they took her brother.",
          responses: [{ text: "Take care.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
