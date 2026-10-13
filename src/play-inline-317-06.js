// play-inline-317 06 — end
// Lines 1567-1949 of readable/play-inline-317.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "ph_dn_mystery_meat",
      type: "aid",
      name: "Mystery Meat Platter",
      weight: 1,
      value: 15,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [45, 10], rads: 6 },
      desc: 'Grey-brown, generous, gravy on everything. Tastes like chicken, if the chicken had been somewhere. A faint green sheen on the gravy is "part of the recipe."',
    });
    K.defineItem({
      id: "ph_dn_blue_plate",
      type: "aid",
      name: "Blue Plate Special",
      weight: 1,
      value: 20,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [60, 12], attrs: { brawn: 1 }, duration: 300 },
      desc: "burrow rat pot roast, spud mash, gravy, served on a genuine blue plate. Clean-fed, rad-free, Spiro swears on his mother. +1 STR while it lasts.",
    });
    K.defineItem({
      id: "ph_dn_coffee",
      type: "aid",
      name: "Empire Diner Coffee",
      weight: 0.5,
      value: 5,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { stamina: 15, hp: 5 },
      desc: "Bottomless (subject to availability). Strong enough to strip chrome.",
    });
    K.defineItem({
      id: "ph_dn_ledger",
      type: "note",
      name: "Spiro's Feed Ledger",
      weight: 0,
      value: 0,
      title: 'Feed ledger — "the girls"',
      text: "BERTHA — 41 lbs (!!) — 3 scoops Glow-Gro\nMAUDE — 18 lbs — 2 scoops\nLIL' SUE — 12 lbs — 1 scoop (picky)\n\nGlow-Gro Feed, from the Glowkeepers at St. Pat's: 10 scrip a sack. The girls DOUBLE in size. Customers say the Mystery Meat \"has a kick.\" That's the Glow, baby.\n\nNB: Earl K. (counter) asked why his fingernails glow in the dark. Told him it's the coffee. Must cut back the scoops. Must NOT tell Bernadette.\nNB 2: Bertha bit through the pen again. She's smart. She's very, very big.",
    });
    K.defineItem({
      id: "ph_dn_recipe_card",
      type: "misc",
      name: "Spiro's Recipe Card",
      weight: 0,
      value: 40,
      desc: 'A grease-spotted index card: "MYSTERY MEAT — burrow rat, clean-fed, braised in Fizzo Cola, onion, a secret spice (it\'s salt)." Signed with a flourish: G. Papadakis, Empire Diner, est. 1946 (re-est. 1972).',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph_mystery_meat",
        name: "Mystery Meat",
        giver: "Bernadette Wisniewski",
        location: "Empire Diner",
        desc: "Bernadette Wisniewski's husband Earl eats the Mystery Meat Platter at the Empire Diner every single day. Now his fingernails glow in the dark. She wants to know what Spiro, the cook, is really putting in it.",
        stages: [
          {
            id: "ask",
            text: "Ask Spiro what's in the Mystery Meat.",
            markers: [{ npc: "ph_gus", label: "Spiro" }],
          },
          {
            id: "cellar",
            text: "Search the Empire Diner's cellar (hatch in the kitchen).",
            markers: [() => dnMarker("hatch", "Cellar Hatch")],
          },
          {
            id: "pens",
            text: "Find out what Spiro keeps in the cellar.",
            markers: [() => dnMarker("ledger", "Cellar")],
          },
          {
            id: "bertha",
            text: "(Optional) Put down Big Bertha, the escaped burrow rat.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.active("ph_mystery_meat"),
            doneIf: () => !!PH.flag("dn_bertha"),
          },
          {
            id: "decide",
            text: "Confront Spiro, or tell Bernadette what you found.",
            markers: [
              { npc: "ph_gus", label: "Spiro" },
              { npc: "ph_dolores", label: "Bernadette" },
            ],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("ph_dlg_gus", {
      start: () =>
        K.q.active("ph_mystery_meat") &&
        K.has("ph_dn_ledger") &&
        !PH.flag("dn_choice")
          ? "caught"
          : PH.flag("met_gus")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Spiro Papadakis",
          onEnter: () => PH.setFlag("met_gus", true),
          text: "Siddown, siddown! Empire Diner, open twenty-four hours since nineteen forty-six — well, with one little break. I'm Spiro. What'll it be? Special today is the Mystery Meat Platter. Special every day is the Mystery Meat Platter.",
          responses: [
            { text: "Let me see the menu.", barter: true, end: true },
            { text: "What's in the Mystery Meat?", next: "meat" },
            { text: "Nice place. Still standing, even.", next: "place" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Spiro Papadakis",
          text: "Back for more! I knew it. Nobody leaves the Empire hungry. Some leave a little greener, ha ha. Kidding. Mostly.",
          responses: [
            { text: "Show me what you've got.", barter: true, end: true },
            {
              text: "Seriously, what's in the Mystery Meat?",
              next: "meat",
              cond: () => !PH.flag("dn_choice"),
            },
            {
              text: "How are the... girls?",
              next: "girls",
              cond: () =>
                PH.flag("dn_choice") === "truth" ||
                PH.flag("dn_choice") === "reform",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        place: {
          speaker: "Spiro Papadakis",
          text: "Rode out the bombs in the walk-in. Came out with no eyebrows and a burn down one cheek — that's why the face. Stainless steel, kid. Built like a battleship on wheels. The Empire State lost its windows; my little Empire State on the roof didn't lose a thing.",
          responses: [
            { text: "What's in the Mystery Meat?", next: "meat" },
            { text: "Goodbye.", end: true },
          ],
        },
        meat: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            if (K.q.active("ph_mystery_meat"))
              K.q.set("ph_mystery_meat", "cellar");
          },
          text: "Now that's a family secret. My pop's recipe, and his pop's. Meat, gravy, love. And a secret spice. You want to know more than that, you gotta marry into the family, and I'm spoken for.",
          responses: [
            {
              text: "[Persuasion 45] Spiro. People are glowing.",
              check: { skill: "persuasion", value: 45 },
              next: "confess",
              failNext: "deflect",
            },
            { text: "Fine. Keep your secrets.", end: true },
          ],
        },
        deflect: {
          speaker: "Spiro Papadakis",
          text: "Glowing! That's the healthy glow of a well-fed customer. Next you'll be telling me my coffee is too strong. Kitchen's staff only, by the way. Totally unrelated.",
          responses: [{ text: "Uh-huh.", end: true }],
        },
        confess: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            PH.setFlag("dn_confessed", true);
            if (K.q.active("ph_mystery_meat"))
              K.q.set("ph_mystery_meat", "pens");
          },
          text: "(He glances at Bernadette and drops his voice.) ...burrow rat. It's burrow rat, okay? I raise 'em in the cellar. Clean, cheap, tender. Only — I buy this feed from the Glowkeeper kids, Glow-Gro, and it makes 'em grow like crazy, and maybe it makes the meat a little... hot. And Bertha, my biggest girl, she got out of the pen last night and now I can't go down there. Here — the hatch. Take a look. Just don't tell Bernadette. Please.",
          responses: [{ text: "I'll take a look.", end: true }],
        },
        caught: {
          speaker: "Spiro Papadakis",
          text: "(He sees the ledger in your hand and deflates like a soufflé.) Yeah. Yeah, okay. Glow-Gro. Forty-one pounds of Bertha. I know. So what happens now?",
          responses: [
            {
              text: "Switch to clean feed and tell your customers the truth.",
              next: "reform",
              standing: 15,
              action: () => decide("reform"),
            },
            {
              text: '[Persuasion 60] Switch the feed — and put "Clean-Fed Burrow Rat" on the menu. People will pay extra.',
              check: { skill: "persuasion", value: 60 },
              next: "reform_plus",
              failNext: "reform",
              action: () => decide("reform"),
            },
            {
              text: "Two hundred scrip and Bernadette never hears about it.",
              next: "blackmail",
              standing: -30,
              action: () => decide("blackmail"),
            },
            { text: "I'm telling Bernadette everything.", next: "truth_warn" },
          ],
        },
        reform: {
          speaker: "Spiro Papadakis",
          text: "Clean feed. Scraps, spuds, the odd giant roach. Slower, but nobody'll glow. And the Blue Plate Special goes back on the board. Here, kid — on the house, forever. Go tell Bernadette her Earl's gonna be fine.",
          responses: [{ text: "Deal.", end: true }],
        },
        reform_plus: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            if (!PH.flag("dn_card")) {
              PH.setFlag("dn_card", true);
              K.give("ph_dn_recipe_card", 1);
              K.scrip(75);
            }
          },
          text: '"Clean-Fed." Ha! Kid, you\'re a genius. Charge double for the same rat and call it health food. Take my recipe card — framed copy goes on the wall. And a cut of the first week.',
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        blackmail: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            if (!PH.flag("dn_paid")) {
              PH.setFlag("dn_paid", true);
              K.scrip(200);
            }
          },
          text: "(He counts out scrip with shaking grey fingers.) Two hundred. That's the whole register and my rainy-day jar. You're a real piece of work, you know that?",
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        truth_warn: {
          speaker: "Spiro Papadakis",
          text: "Go on, then. Tell her. She'll take her Earl and go, and so will everybody else, and the Empire goes dark for the first time since the bombs. ...Or I switch the feed. Your call, kid.",
          responses: [
            {
              text: "Switch the feed.",
              next: "reform",
              standing: 10,
              action: () => decide("reform"),
            },
            {
              text: "She deserves the truth.",
              end: true,
              action: () => PH.setFlag("dn_tell", true),
            },
          ],
        },
        girls: {
          speaker: "Spiro Papadakis",
          text: "Clean-fed and happy. Maude had babies. I named one after you. It bit me. Very fitting.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_dolores", {
      start: () =>
        K.q.done("ph_mystery_meat")
          ? "after"
          : K.q.active("ph_mystery_meat") &&
              (PH.flag("dn_choice") ||
                PH.flag("dn_tell") ||
                K.has("ph_dn_ledger"))
            ? "report"
            : K.q.active("ph_mystery_meat")
              ? "waiting"
              : "hello",
      nodes: {
        hello: {
          speaker: "Bernadette Wisniewski",
          text: "You look like somebody who isn't afraid of a kitchen. Listen, hon. My Earl — he eats the Mystery Meat here every single day, God knows why. Last week his fingernails started glowing. In the DARK. Spiro says it's the coffee. It is not the coffee.",
          responses: [
            {
              text: "I'll find out what's in it.",
              next: "accept",
              action: () => K.q.start("ph_mystery_meat"),
            },
            { text: "Maybe Earl should order something else.", next: "earl" },
            { text: "Not my business.", end: true },
          ],
        },
        earl: {
          speaker: "Bernadette Wisniewski",
          text: "Earl has ordered the same thing every day for forty years. Before the bombs it was the meatloaf. When the meatloaf ran out he cried for a week. So no. Please, hon — just find out what Spiro is putting in there.",
          responses: [
            {
              text: "All right. I'll look into it.",
              next: "accept",
              action: () => K.q.start("ph_mystery_meat"),
            },
            { text: "No.", end: true },
          ],
        },
        accept: {
          speaker: "Bernadette Wisniewski",
          text: "Bless you. Spiro won't say a word — but he keeps going down through a hatch in the kitchen with buckets of something green. I'll be right here. Where else would I be?",
          responses: [{ text: "Back soon.", end: true }],
        },
        waiting: {
          speaker: "Bernadette Wisniewski",
          text: "Well? Anything? Earl read the newspaper in the dark last night. Without a lamp.",
          responses: [{ text: "Still looking.", end: true }],
        },
        report: {
          speaker: "Bernadette Wisniewski",
          text: "You're back. You look like you've seen something. Tell me straight, hon.",
          responses: [
            {
              text: "burrow rats, raised on radioactive feed. Spiro is switching to clean feed. Earl will be fine.",
              next: "relief",
              cond: () => PH.flag("dn_choice") === "reform",
              standing: 10,
              action: () => finishMeat("reform"),
            },
            {
              text: "burrow rats, fed on glowing fungus. Spiro knew. (Show her the ledger.)",
              next: "furious",
              cond: () => K.has("ph_dn_ledger"),
              action: () => finishMeat("truth"),
            },
            {
              text: "It's nothing. Just gravy. Earl's fine.",
              next: "lie",
              standing: -10,
              action: () => finishMeat("lie"),
            },
          ],
        },
        relief: {
          speaker: "Bernadette Wisniewski",
          text: "burrow rat! Well — I've eaten worse at my sister's. As long as it stops glowing. Here, hon, for your trouble. Earl saved these for a rainy day. It's always a rainy day now.",
          responses: [{ text: "Take care, Bernadette.", end: true }],
        },
        furious: {
          speaker: "Bernadette Wisniewski",
          text: "He KNEW? That grey-faced son of a — GUS! (She storms over to the counter; there is shouting; then, remarkably, a truce.) He says he'll change the feed. He also says I'm banned. We'll see about that. Thank you, hon. Take this.",
          responses: [{ text: "Glad to help.", end: true }],
        },
        lie: {
          speaker: "Bernadette Wisniewski",
          text: "Just gravy. Well... all right. If you say so. (She doesn't quite believe you, but she wants to.) Thank you for looking, anyway.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after: {
          speaker: "Bernadette Wisniewski",
          text: "Earl says hello. From the booth. He's eating the Blue Plate now. He doesn't glow anymore, but he does hum. We're working on it.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_flo", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Flo",
          text: "WELCOME TO THE EMPIRE DINER. MY NAME IS FLO. I WILL BE YOUR SERVER. MAY I RECOMMEND THE MYSTERY MEAT. IT IS A MYSTERY. I HAVE NOT BEEN AUTHORISED TO SOLVE IT.",
          responses: [
            { text: "What's in the cellar, Flo?", next: "cellar" },
            { text: "Just coffee, thanks.", next: "coffee" },
            { text: "Goodbye.", end: true },
          ],
        },
        cellar: {
          speaker: "Flo",
          text: "CELLAR ACCESS IS RESTRICTED TO GUS. FLO ATTEMPTED TO TIDY THE CELLAR ON 14 OCCASIONS. THE CELLAR BIT FLO ON 14 OCCASIONS. FLO NO LONGER TIDIES THE CELLAR.",
          responses: [{ text: "Thanks, Flo.", end: true }],
        },
        coffee: {
          speaker: "Flo",
          onEnter: () => {
            if (!PH.flag("flo_coffee")) {
              PH.setFlag("flo_coffee", true);
              K.give("ph_dn_coffee", 1);
            }
          },
          text: "ONE COFFEE. BOTTOMLESS. PLEASE DO NOT TEST THIS CLAIM.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
