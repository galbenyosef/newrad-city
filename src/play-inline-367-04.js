// play-inline-367 04 — responses
// Lines 721-1060 of readable/play-inline-367.pretty.js (statement-aligned).
  PF.onInitDone.push(() => {
    G.events.on("itemAdded", (id) => {
      if (
        id === "pws_great_seal" &&
        !PF.q.complete("pws_seal") &&
        !PF.flag("seal_sold")
      ) {
        if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
        if (PF.q.stage("pws_seal") !== "return") PF.q.set("pws_seal", "return");
      }
    });
  });
  PF.trigger(
    { x0: 9400 - 150, x1: 9400 + 150, z0: 1600 - 150, z1: 1600 + 150 },
    () => {
      PF.q.advance(
        "pws_deposit",
        ["enter"],
        PF.flag("fw_vault_open") ? "box" : "vault",
      );
    },
    {
      repeat: true,
      cond: () =>
        PF.q.active("pws_deposit") && PF.q.stage("pws_deposit") === "enter",
    },
  );

  // ---------------------------------------------------------------
  // Dialogue — St. Paul's Refuge
  // ---------------------------------------------------------------
  const haveSeal = () => PF.inv.count("pws_great_seal") > 0;
  PF.dialogue("pws_dlg_constance", {
    start: () =>
      PF.q.complete("pws_seal")
        ? "after"
        : haveSeal()
          ? "return"
          : PF.q.active("pws_seal")
            ? "waiting"
            : PF.flag("seal_sold")
              ? "sold"
              : "root",
    nodes: {
      root: {
        speaker: "Sister Constance",
        text: "Welcome to St. Paul's, traveller. The door is unlocked, the soup is at sundown, and the only rule that matters is the one on the board: weapons holstered. I'm Sister Constance. I keep this place — or it keeps me. Hard to say, after twenty years.",
        responses: [
          { text: "What is this place?", next: "history" },
          {
            text: "There's an empty frame over the pew in the north aisle.",
            next: "seal",
          },
          { text: "Is there anything I can do to help?", next: "seal" },
          { text: "Take care, Sister." },
        ],
      },
      history: {
        speaker: "Sister Constance",
        text: "The oldest church on the island. 1766. It survived the fire of '76, when the rest of the west side burned. It survived the bombs, and the fires that followed. Washington prayed in that pew after they swore him in on Wall Street. These days, people who have nowhere else to pray — or sleep — use it. He wouldn't mind. He was a practical man.",
        responses: [
          { text: "And the empty frame?", next: "seal" },
          { text: "Thank you, Sister." },
        ],
      },
      seal: {
        speaker: "Sister Constance",
        text: "That held the first painting ever made of the Great Seal. Eagle, shield, thirteen stars. In the spring the Stitchers came — the raiders in the Singer Building, the tall red tower with the dome on Liberty Street. Their matriarch, a woman who calls herself Madame Bobbin, cut it down with a pair of shears while I prayed. It hangs in her nest now, up in the lantern at the very top. A trophy.",
        responses: [
          {
            text: "I'll get it back for you.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
            },
          },
          {
            text: "[Persuasion 50] Climbing a raider tower for a painting? I'd need a reason.",
            check: { skill: "persuasion", value: 50 },
            next: "speech",
            failNext: "speechFail",
          },
          { text: "It's a painting. People are starving.", next: "painting" },
          { text: "Not my business.", next: "decline" },
        ],
      },
      painting: {
        speaker: "Sister Constance",
        text: "They are. And they come here, and they eat, and then they sit in that aisle and look up at the empty frame. I didn't understand it either, at first. It isn't about the painting. It's about whether anything old can stay where it belongs. Out there, nothing does.",
        responses: [
          {
            text: "All right. I'll bring it back.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
            },
          },
          { text: "Maybe some other time.", next: "decline" },
        ],
      },
      speech: {
        speaker: "Sister Constance",
        text: "[She smiles thinly.] A practical soul. Very well: the refuge's watch rifle has been waiting for someone better than Hezekiah, and the Lord knows he'll be relieved to be rid of the responsibility. Bring the Seal home and the Vigil is yours — and whatever the collection plate holds that week.",
        responses: [
          {
            text: "Deal.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
              PF.setFlag("constance_bonus", true);
            },
          },
        ],
      },
      speechFail: {
        speaker: "Sister Constance",
        text: "A reason? You have a conscience, I assume. It's usually reason enough. If yours is out of order, the soup is still free.",
        responses: [
          {
            text: "Fine. I'll get your painting.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
            },
          },
          { text: "Pass.", next: "decline" },
        ],
      },
      accept: {
        speaker: "Sister Constance",
        text: "God go with you — and a lot of ammunition. The Singer is two blocks south, this side of Trinity. They charge a toll in the lobby. Hezekiah in our belfry says the stairs are the only way up; the elevators have been dead since the bombs. Bobbin herself sits in the lantern with a long rifle. She waves at Hezekiah. Don't let her wave at you.",
        responses: [{ text: "I'll be back with it." }],
      },
      decline: {
        speaker: "Sister Constance",
        text: "Then rest a while at least. You look like you need it.",
        responses: [{ text: "[Leave]" }],
      },
      waiting: {
        speaker: "Sister Constance",
        text: "The Singer Building, the lantern at the very top. Please be careful. I would rather have an empty frame than another grave in the yard.",
        responses: [
          { text: "Tell me about the Stitchers again.", next: "accept" },
          { text: "I'm on it." },
        ],
      },
      return: {
        speaker: "Sister Constance",
        text: "Is that — oh. Oh, look at it. They didn't even scratch the gilt. [She takes the frame in both hands and is quiet for a long moment.] Thank you.",
        responses: [
          { text: "It belongs here.", next: "reward" },
          { text: "[Keep it for now]", next: "keep" },
        ],
      },
      keep: {
        speaker: "Sister Constance",
        text: "[Her face doesn't change, but her hands let go.] I see. Well. It's yours to carry, then. The door is still unlocked.",
        responses: [{ text: "[Leave]" }],
      },
      reward: {
        speaker: "Sister Constance",
        text: () =>
          "Take the Vigil — the watch rifle from our belfry. Hezekiah says it shoots true and he's the most honest man I know, mostly because he can't lie with a straight face." +
          (PF.flag("constance_bonus")
            ? " And the collection plate. Don't argue."
            : "") +
          " Whenever you're on Fulton Street, there's a cot here with your name on it.",
        onEnter: () => {
          if (!PF.q.active("pws_seal") && !PF.q.started("pws_seal"))
            PF.q.start("pws_seal");
          if (PF.q.complete("pws_seal")) return;
          PF.inv.remove("pws_great_seal", 1);
          PF.setFlag("seal_returned", true);
          PF.inv.add("pws_vigil", 1);
          if (PF.flag("constance_bonus")) PF.inv.addScrip(75);
          PF.q.done("pws_seal");
          PF.news(
            "From Fulton Street: the painting of the Great Seal is back above George Washington's pew at St. Paul's Chapel. The Stitchers in the Singer Building are reportedly short one matriarch and one painting, and long on bad moods.",
          );
        },
        responses: [{ text: "Thank you, Sister." }],
      },
      after: {
        speaker: "Sister Constance",
        text: "Every evening someone sits in the north aisle and looks up at it. I think that's worth more than I can say. Rest well, friend.",
        responses: [
          { text: "Tell me about the chapel again.", next: "history" },
          { text: "Goodbye, Sister." },
        ],
      },
      sold: {
        speaker: "Sister Constance",
        text: "Hattie Fenwick sent word she's \"holding\" our Seal. Holding. [She folds her hands.] Well. The frame will wait. It has patience; I'm learning it.",
        responses: [{ text: "[Leave]", standing: -5 }],
      },
    },
  });
  PF.dialogue("pws_dlg_doc", {
    start: "root",
    nodes: {
      root: {
        speaker: "Doc Ainsworth",
        text: "Doctor Ainsworth. Yes, a real one, no, I don't take chickens anymore, and yes, I was a doctor before the war — pediatrics, if you can believe it. Where does it hurt?",
        responses: [
          {
            text: "Patch me up. (30 scrip)",
            cond: () => PF.inv.scrip() >= 30,
            action: () => {
              if (PF.inv.pay(30)) {
                try {
                  G.player.heal(G.player.maxHp);
                } catch (e) {
                  /* core */
                }
                G.notify(
                  "Doc Ainsworth stitches you up. Good as new. Well, as new as anything is.",
                );
                PF.sfx("inject");
              }
            },
          },
          {
            text: "Flush the rads. (60 scrip)",
            cond: () => PF.inv.scrip() >= 60,
            action: () => {
              if (PF.inv.pay(60)) {
                try {
                  G.player.addRads(-(G.player.rads || 0));
                } catch (e) {
                  /* core */
                }
                G.notify(
                  "Four capsules of Prussian Blue and a lecture later, your Geiger counter calms down.",
                );
                PF.sfx("iodine_tabs");
              }
            },
          },
          { text: "What do you have for sale?", barter: true },
          { text: "Pediatrics?", next: "kids" },
          { text: "I'm fine." },
        ],
      },
      kids: {
        speaker: "Doc Ainsworth",
        text: "Mount Sinai, twelve years. Then the bombs, and then twenty-two years of setting bones for grown-ups who should know better. The refuge has two babies now. First babies I've delivered since 1967. I cried. Don't tell Ramona.",
        responses: [{ text: "Your secret's safe." }],
      },
    },
  });
  PF.dialogue("pws_dlg_mercy", {
    start: "root",
    nodes: {
      root: {
        speaker: "Mercy Tolliver",
        text: "Soup's at sundown, supplies are whenever. I trade for the refuge — everything goes back into the pot, so don't haggle too hard, you'll make the orphans cry.",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "Heard anything interesting around here?", next: "rumors" },
          { text: "See you around." },
        ],
      },
      rumors: {
        speaker: "Mercy Tolliver",
        text: "Four things you should know about this end of the island. One: the Stitchers in the Singer tower charge a toll and take ears. Two: the old bank at 40 Wall — green roof — is full of robots that think it's still Monday morning, 1967. Three: Hattie Fenwick at the Custom House buys and sells anything, and pays fair. Four: the Sister stole my ladle and I want it back.",
        responses: [
          { text: "The Custom House?", next: "ch" },
          { text: "Thanks, Mercy." },
        ],
      },
      ch: {
        speaker: "Mercy Tolliver",
        text: "Big stone palace down by the Battery, with the four ladies on thrones out front. Convoys come and go from there all day. Hattie's been asking around for someone crazy enough to go into the bank. Figured you might qualify.",
        responses: [{ text: "I'll take that as a compliment." }],
      },
    },
  });
  PF.dialogue("pws_dlg_wendell", {
    start: "root",
    nodes: {
      root: {
        speaker: "Old Wendell",
        text: "Hm? Oh. Sit, sit. This is Washington's pew, you know. The General himself. After they swore him in over on Wall Street — right by that bank with the robots, as it happens — he walked up Broadway and sat right here. Right where I'm sitting. Well. Near enough.",
        responses: [
          { text: "What was above the pew?", next: "seal" },
          { text: "You look comfortable.", next: "comfy" },
          { text: "I'll let you rest." },
        ],
      },
      seal: {
        speaker: "Old Wendell",
        text: "The Seal! The eagle! Painted for the General's visit, they said. And those needle-and-thread hooligans cut it down. Took the eagle and left the Sister praying. Bah. In my day we stole things with dignity.",
        responses: [
          { text: "Your day?", next: "day" },
          { text: "I'll see what I can do." },
        ],
      },
      day: {
        speaker: "Old Wendell",
        text: "My granddad fixed the steeple clock. It's been at a quarter to ten since the bombs. Every clock in Manhattan says a quarter to ten. You'd think somebody would take the hint.",
        responses: [{ text: "Take care, Wendell." }],
      },
      comfy: {
        speaker: "Old Wendell",
        text: "Box pews. Kept the drafts off the gentry. Kept the Sister off me when I nap. Best seat in the house. There's a key to the Reliquary somewhere up in Hezekiah's box in the steeple, by the way. You didn't hear it from me. I'm asleep.",
        responses: [{ text: "[Leave him to his nap]" }],
      },
    },
  });
  PF.dialogue("pws_dlg_hezekiah", {
    start: "root",
    nodes: {
      root: {
        speaker: "Hezekiah",
        text: "Mind the rope, that's the bell. You ring that and the whole refuge grabs a gun. Last guy who leaned on it caused a stampede and a very awkward wedding.",
        responses: [
          { text: "What can you see from up here?", next: "see" },
          { text: "What's in the strongbox?", next: "box" },
          { text: "How do you open the strongbox?", next: "combo" },
          { text: "Carry on." },
        ],
      },
      see: {
        speaker: "Hezekiah",
        text: "Singer tower's south — tall red one with the dome. Bobbin sits up in the lantern with a rifle like mine. The green pyramid past it is the Manhattan Company bank; lights still on in the basement at night, robots walking the steps. And the Custom House down by the water, with the convoys. Good neighbourhood, if you don't count the neighbours.",
        responses: [{ text: "Thanks." }],
      },
      box: {
        speaker: "Hezekiah",
        text: "Emergency kit and the Reliquary key. Sister's orders: nobody opens it unless it's an emergency. I've decided it's never an emergency. It's very restful.",
        responses: [{ text: "Fair enough." }],
      },
      combo: {
        speaker: "Hezekiah",
        text: "Combination's the year the chapel was built. Seventeen sixty-six. One-seven-six-six. ...I wasn't supposed to say that out loud, was I. Well. If it's an emergency, it's an emergency.",
        learn: "pws_lk_sp_belfry",
        responses: [{ text: "Your secret's safe." }],
      },
    },
  });
