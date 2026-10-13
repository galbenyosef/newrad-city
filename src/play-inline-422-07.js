// play-inline-422 07 — end
// Lines 1959-2244 of readable/play-inline-422.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "ph2_pump_governor",
      type: "misc",
      name: "Fireboat Pump Governor",
      weight: 3,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: "A brass centrifugal governor the size of a coffee can, stamped F.D.N.Y. MARINE DIV. — PATRICK DUGGAN. Salt-crusted, but the flyweights still spin.",
    });
    K.defineItem({
      id: "ph2_ferry_token",
      type: "misc",
      name: "Slack Tide Token",
      weight: 0,
      value: 15,
      tags: ["valuable"],
      desc: "A brass 1950s subway-style token with a ferry stamped on it. Tilly at the Slack Tide takes them for a drink. So does everyone else, at a discount.",
    });
    K.defineItem({
      id: "ph2_harbor_chowder",
      type: "aid",
      name: "Slack Tide Chowder",
      weight: 0.5,
      value: 12,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 25, rads: 2 },
      desc: "Shellback, potato-ish tubers, powdered milk and a dash of something from a bottle with no label. Tilly's pride.",
    });
    K.defineItem({
      id: "ph2_ferry_grog",
      type: "aid",
      name: "Ferryman's Grog",
      weight: 0.5,
      value: 10,
      tags: ["drink", "alcohol"],
      mesh: "bottle_whiskey",
      sound: "drink",
      effects: { hp: 5, attrs: { brawn: 1, wits: -1 }, duration: 180 },
      desc: 'Rum cut with boiled harbour water and a Fizzo Cola "for colour." It is mostly colour.',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph2_slack_water",
        name: "Slack Water",
        giver: "Gus Bellamy",
        location: "Whitehall Ferry Terminal",
        desc: "The Margaret Corbin is taking on water faster than her hand pumps can move it. Gus Bellamy, the ferry's last engineer, needs a pump governor — and there is one on the sunken fireboat at Pier A.",
        stages: [
          {
            id: "fetch",
            text: "Salvage the pump governor from the sunken fireboat at Pier A.",
            markers: [
              () => {
                const a = PV.anchor("pier_a", "hatch");
                return a
                  ? { x: a.x, y: a.y, z: a.z, label: "Fireboat engine hatch" }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Bring the pump governor to Gus Bellamy aboard the Margaret Corbin.",
            markers: [{ npc: "ph2_gus", label: "Gus" }],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q,
      S = PV;
    G.dialogue.register("ph2_dlg_rosa", {
      start: () => (S.flag("wh_met_rosa") ? "again" : "hello"),
      nodes: {
        hello: {
          speaker: "Big Bertha Sorensen",
          onEnter: () => S.setFlag("wh_met_rosa", true),
          text: "[A broad woman in a patched duster, ledger under one arm, pencil behind her ear, pistol on her hip where everyone can see it.] Welcome to the Whitehall Caravan Stage. Every pack train between the Bronx and the bridges comes through my ferry house. You buying, selling, or looking for work?",
          responses: [
            { text: "Buying. Let's trade.", barter: true, end: true },
            { text: "What is this place?", next: "place" },
            { text: "Looking for work.", next: "work" },
            { text: "Just passing through.", end: true },
          ],
        },
        again: {
          speaker: "Big Bertha Sorensen",
          text: () =>
            q.done("ph2_slack_water")
              ? "The Corbin's pumps are running and Tilly's pouring again. You're good people. Mostly. What do you need?"
              : "Back again. Scrip talk, the rest walks. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Any work?", next: "work" },
            { text: "Tell me about the caravans.", next: "routes" },
            { text: "Later, Bertha.", end: true },
          ],
        },
        place: {
          speaker: "Big Bertha Sorensen",
          text: "Staten Island Ferry, once upon a time. Thirty thousand people a day through those doors, five cents a head. Now it's oxen, scrap and folks who want to sleep somewhere with a roof and a guard. Water's on three sides — nobody sneaks up on Whitehall.",
          responses: [
            { text: "And the ferries?", next: "ferries" },
            { text: "Tell me about the caravans.", next: "routes" },
            { text: "Thanks.", end: true },
          ],
        },
        ferries: {
          speaker: "Big Bertha Sorensen",
          text: "The Corbin's still afloat in slip one — barely. Tilly runs a bar on her, the Slack Tide. Her sister, the Richmond, went down in slip three the winter before last. Gus keeps the Corbin breathing. Talk to him if you're handy.",
          responses: [{ text: "I'll look him up.", end: true }],
        },
        routes: {
          speaker: "Big Bertha Sorensen",
          text: "Crow's Hat runs Brooklyn over the bridge. Two-Horn Traders go north to the Bronx when the brutes let 'em. Nobody goes to Jersey. You want to ride along, you pay or you shoot — guards eat free.",
          responses: [{ text: "Good to know.", end: true }],
        },
        work: {
          speaker: "Big Bertha Sorensen",
          text: () =>
            q.active("ph2_slack_water") || q.done("ph2_slack_water")
              ? "Nothing I can't handle myself right now. Check the board by the doors — sometimes the caravans post jobs."
              : "Gus Bellamy — the Corbin's engineer — has been yelling about pumps all week. Go see him on the ferry before he sinks my best-paying bar.",
          responses: [{ text: "Will do.", end: true }],
        },
      },
    });
    G.dialogue.register("ph2_dlg_gus", {
      start: () => {
        if (q.done("ph2_slack_water")) return "after";
        if (q.active("ph2_slack_water"))
          return K.has("ph2_pump_governor") ? "got" : "wait";
        return "hello";
      },
      nodes: {
        hello: {
          speaker: "Gus Bellamy",
          text: "[A wiry old man up to his knees in bilge water, working a hand pump like it owes him money.] Don't just stand there dripping on my deck — oh, it's all wet anyway. Hear that? That's the Corbin drinking the harbour. Main bilge pump's fine. The governor on it isn't. Without one the pump runs away with itself and shakes the mounts loose.",
          responses: [
            {
              text: "Would a governor off the fireboat at Pier A do? I have one.",
              cond: () => K.has("ph2_pump_governor"),
              next: "got",
              action: () => K.q.start("ph2_slack_water"),
            },
            { text: "Where do I get a governor?", next: "where" },
            {
              text: "[Mechanics 50] Couldn't you machine a new one?",
              check: { skill: "mechanics", value: 50 },
              next: "machine",
              failNext: "machine_fail",
            },
            { text: "Good luck with that.", end: true },
          ],
        },
        where: {
          speaker: "Gus Bellamy",
          text: "Pier A. Fire Department kept their fireboat there — the PATRICK DUGGAN. She went down at her berth when the bombs fell, but her pumps were the same make as ours. Engine hatch is aft of the wheelhouse. Shellbacks nest on that pier, mind. Bring me that governor and there's scrip in it, and Tilly'll pour you free till I say stop.",
          responses: [
            {
              text: "I'll get it.",
              next: "yes",
              action: () => K.q.start("ph2_slack_water"),
            },
            { text: "Shellbacks? Pass.", end: true },
          ],
        },
        machine: {
          speaker: "Gus Bellamy",
          text: "Ha! You know your way around a lathe. Sure — with what? The lathe's under four feet of water in the engine room. No, we do it the honest way: steal one off a dead fireboat. Pier A.",
          responses: [
            {
              text: "Fine. Pier A.",
              next: "yes",
              action: () => K.q.start("ph2_slack_water"),
            },
          ],
        },
        machine_fail: {
          speaker: "Gus Bellamy",
          text: "Machine one? Out of what, harbour mud? No. There's one on the fireboat at Pier A.",
          responses: [
            {
              text: "I'll get it.",
              next: "yes",
              action: () => K.q.start("ph2_slack_water"),
            },
            { text: "Not my problem.", end: true },
          ],
        },
        yes: {
          speaker: "Gus Bellamy",
          onEnter: () => {
            if (K.has("ph2_pump_governor") && q.active("ph2_slack_water"))
              K.q.set("ph2_slack_water", "return");
          },
          text: "Good. Engine hatch, aft of the wheelhouse. Twelve bolts. Don't drop it in the drink. And don't get eaten — I'm too old to train another hero.",
          responses: [{ text: "On my way.", end: true }],
        },
        wait: {
          speaker: "Gus Bellamy",
          text: "[Pump, pump, pump.] Still here. Still pumping. Pier A, the fireboat, the governor. Anytime you like.",
          responses: [{ text: "Working on it.", end: true }],
        },
        got: {
          speaker: "Gus Bellamy",
          text: "[He stops pumping. He actually stops.] Is that — let me see it. Flyweights spin, springs are good, stamped DUGGAN... You beautiful lunatic. Give it here.",
          responses: [
            {
              text: "Here you go.",
              next: "install",
              action: () => {
                K.take("ph2_pump_governor", 1);
              },
            },
          ],
        },
        install: {
          speaker: "Gus Bellamy",
          text: "[Ten minutes of swearing later, somewhere below, a motor coughs, catches, and settles into a steady thrum. The water around your boots begins, very slowly, to go down.] Listen to her! Slack water at last. Here — scrip, and a pocketful of Tilly's tokens. Drinks are on the Corbin.",
          onEnter: () => {
            if (K.q.active("ph2_slack_water")) {
              S.setFlag("wh_pumps", true);
              K.scrip(150);
              K.give("ph2_ferry_token", 5);
              K.give("rally_tonic", 2);
              K.standing(20, "Saved the Margaret Corbin");
              K.q.complete("ph2_slack_water");
              PV.whPumps && PV.whPumps();
            }
          },
          responses: [{ text: "Glad to help.", end: true }],
        },
        after: {
          speaker: "Gus Bellamy",
          text: "Dry as a Civil Defense pamphlet down there now. Well — damp. Damp as a pamphlet. You ever need a boat fixed, you know where I am.",
          responses: [{ text: "Take care, Gus.", end: true }],
        },
      },
    });
    G.dialogue.register("ph2_dlg_tilly", {
      start: () => "hello",
      nodes: {
        hello: {
          speaker: "Tilly Ahn",
          text: () =>
            S.flag("wh_pumps")
              ? "[She slides a glass down the bar without being asked.] Hero of the bilge! First one's free. So's the second. The third, Gus pays for."
              : "Welcome aboard the Slack Tide, the only bar in New York that's actually sinking. Mind the puddles — they're load-bearing.",
          responses: [
            { text: "What are you pouring?", barter: true, end: true },
            { text: 'Why "Slack Tide"?', next: "name" },
            { text: "Heard any rumours?", next: "rumor" },
            { text: "See you.", end: true },
          ],
        },
        name: {
          speaker: "Tilly Ahn",
          text: "Slack tide's the moment between the ebb and the flood, when the water just... stops. Nobody's coming in, nobody's going out. Best time for a drink.",
          responses: [{ text: "I'll drink to that.", barter: true, end: true }],
        },
        rumor: {
          speaker: "Tilly Ahn",
          text: () =>
            [
              "Caravaneers say there's a market under the bridges in Brooklyn — the old Empire Stores. Hattie Szabo runs it with a scale she swears is honest. Nobody believes her.",
              "The clock on Pier A stopped at 9:47 the morning the bombs came. Somebody wound it once, years back. Rang all night. Shellbacks came from everywhere.",
              "There's a ferry out past the Statue that still sounds her horn some nights. Nobody's aboard. Nobody that answers, anyway.",
            ][Math.floor(Math.random() * 3)],
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
