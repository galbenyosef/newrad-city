// play-inline-336 06 — next
// Lines 2272-2911 of readable/play-inline-336.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "pev_ale_light",
      type: "aid",
      name: "O'Rourke's Light Ale",
      weight: 0.5,
      value: 3,
      tags: ["drink", "alcohol"],
      mesh: "bottle_beer",
      sound: "drink",
      effects: { hp: 10, stamina: 10, duration: 150, attrs: { presence: 1 } },
      desc: "Pale, cloudy, cold-ish, brewed from an 1854 yeast culture that has outlived every empire it has ever met. Served in pairs. Always in pairs.",
    });
    K.defineItem({
      id: "pev_ale_dark",
      type: "aid",
      name: "O'Rourke's Dark Ale",
      weight: 0.5,
      value: 3,
      tags: ["drink", "alcohol"],
      mesh: "bottle_beer",
      sound: "drink",
      effects: { hp: 14, duration: 150, attrs: { brawn: 1 } },
      desc: "The same as the light, with more roast and more attitude. Leaves a moustache even on people who don't have one.",
    });
    K.defineItem({
      id: "pev_cheese_plate",
      type: "aid",
      name: "Cheese & Onions",
      weight: 0.5,
      value: 8,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hpOverTime: [30, 10] },
      desc: "A slab of sharp cheddar, raw onion, saltines and a mustard hot enough to strip paint. The O'Rourke's lunch since before the Civil War.",
    });
    K.defineItem({
      id: "pev_mcs_cellar_key",
      type: "key",
      name: "O'Rourke's Hatch Key",
      weight: 0,
      value: 0,
      desc: "A small iron key on a bottle-opener ring. Opens the cellar hatch on East 7th Street.",
    });
    K.keyFrom("pev_mcs_cellar_key", 'Deck O\'Rourke — "Cellar Dwellers"');
    K.defineItem({
      id: "pev_orourke_stein",
      type: "misc",
      name: "O'Rourke's Pewter Stein",
      weight: 1,
      value: 160,
      tags: ["valuable", "unique"],
      desc: 'Deck\'s own stein, dented, engraved "BE GOOD OR BE GONE." Holding it, you feel honour-bound to be at least one of those things.',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pev_cellar_dwellers",
        name: "Cellar Dwellers",
        giver: "Deck O'Rourke",
        location: "O'Rourke's Old Ale House",
        desc: "Giant roaches have chewed through the old coal tunnel into O'Rourke's cellar and are getting into the casks. Deck wants them gone before they find the yeast.",
        stages: [
          {
            id: "clear",
            text: "Kill the giant roaches in O'Rourke's cellar.",
            markers: [
              () => {
                const a = EV.anchor("mcs", "roach1");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Cellar",
                      interior: "orourkes",
                    }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Tell Deck the cellar is clear.",
            markers: [{ npc: "pev_deck", label: "Deck" }],
          },
        ],
        rewards: { xp: 120 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const pour = (kind) => () => {
      const free = !EV.flag("mcs_first_round");
      if (!free) {
        if (K.scripCount() < 4) {
          EV.setFlag("mcs_broke", true);
          return;
        }
        K.scrip(-4);
      }
      EV.setFlag("mcs_first_round", true);
      EV.setFlag("mcs_broke", false);
      K.give(kind === "light" ? "pev_ale_light" : "pev_ale_dark", 2);
    };
    G.dialogue.register("pev_dlg_deck", {
      start: () => {
        if (
          q.active("pev_honest_graft") &&
          q.stage("pev_honest_graft") === "collect" &&
          !K.has("pev_tax_envelope")
        )
          return "tax";
        if (
          q.active("pev_honest_graft") &&
          q.stage("pev_honest_graft") === "return"
        )
          return "graft_done";
        if (
          q.active("pev_cellar_dwellers") &&
          q.stage("pev_cellar_dwellers") === "return"
        )
          return "cellar_done";
        return EV.flag("met_deck") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Deck O'Rourke",
          onEnter: () => EV.setFlag("met_deck", true),
          text: "Light or dark?",
          responses: [
            { text: "Light.", next: "light", action: pour("light") },
            { text: "Dark.", next: "dark", action: pour("dark") },
            { text: "What else have you got?", next: "else" },
            { text: "Just one, please.", next: "one" },
            { text: "Who are you?", next: "who" },
          ],
        },
        again: {
          speaker: "Deck O'Rourke",
          text: () =>
            q.done("pev_honest_graft") && EV.flag("graft_good")
              ? "Ah, the hero of the Fourth Ward. Light or dark? — kidding. I know. Two of each."
              : "Back again. Light or dark?",
          responses: [
            { text: "Light.", next: "light", action: pour("light") },
            { text: "Dark.", next: "dark", action: pour("dark") },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Tell me about this place.", next: "history" },
            {
              text: "Heard you've got trouble with Tammany.",
              next: "tammany",
              cond: () => !q.started("pev_honest_graft"),
            },
            {
              text: "About Boss Croke...",
              next: "tammany_again",
              cond: () => q.active("pev_honest_graft"),
            },
            {
              text: "Anything else need doing?",
              next: "cellar",
              cond: () => !q.started("pev_cellar_dwellers"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        light: {
          speaker: "Deck O'Rourke",
          text: () =>
            EV.flag("mcs_broke")
              ? "Four scrip for two. You haven't got four scrip. Come back when you do — or sweep the sawdust, I'm not picky."
              : "Two lights. [He slides two mugs across the bar without looking.] First round for new faces is on the house. Every round after that is four scrip.",
          responses: [
            {
              text: "Why two?",
              next: "why_two",
              cond: () => !EV.flag("asked_two"),
            },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Tell me about this place.", next: "history" },
            { text: "Thanks.", end: true },
          ],
        },
        dark: {
          speaker: "Deck O'Rourke",
          text: () =>
            EV.flag("mcs_broke")
              ? "Four scrip for two. Come back with four scrip. The dark isn't going anywhere. Neither am I. Neither is anybody, anymore."
              : "Two darks. [Thunk. Thunk.] There's a man who knows what he wants.",
          responses: [
            {
              text: "Why two?",
              next: "why_two",
              cond: () => !EV.flag("asked_two"),
            },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Tell me about this place.", next: "history" },
            { text: "Thanks.", end: true },
          ],
        },
        else: {
          speaker: "Deck O'Rourke",
          text: "Light. Or dark.",
          responses: [
            { text: "Is there a difference?", next: "difference" },
            { text: "Light, then.", next: "light", action: pour("light") },
            { text: "Dark, then.", next: "dark", action: pour("dark") },
          ],
        },
        difference: {
          speaker: "Deck O'Rourke",
          text: "One's light. [Long pause.] One's dark. We've been pouring the same two ales since 1854, pal. Through a Civil War, Prohibition, the bombs, and a raider who asked for a white wine spritzer. Only one of those scared me.",
          responses: [
            { text: "Light.", next: "light", action: pour("light") },
            { text: "Dark.", next: "dark", action: pour("dark") },
          ],
        },
        one: {
          speaker: "Deck O'Rourke",
          text: "They come in twos. Like shoes. Like trouble. Like the Proctors over at Cooper Union — you ever see one of those alone, run.",
          responses: [
            { text: "Fine. Light.", next: "light", action: pour("light") },
            { text: "Fine. Dark.", next: "dark", action: pour("dark") },
          ],
        },
        why_two: {
          speaker: "Deck O'Rourke",
          onEnter: () => EV.setFlag("asked_two", true),
          text: "Saves me walking. Also, the first one's for you, and the second one's for whoever you should've brought. Everybody's got somebody they should've brought.",
          responses: [
            { text: "Tell me about this place.", next: "history" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Deck O'Rourke",
          text: "Declan O'Rourke. Deck. My family's poured here since John O'Rourke opened the doors in 1854. I was opening up the morning the bombs fell, Sunday, for the after-Mass crowd. Kept pouring. The radiation made me handsome, as you can see.",
          responses: [
            { text: "Tell me about this place.", next: "history" },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Light, then.", next: "light", action: pour("light") },
          ],
        },
        history: {
          speaker: "Deck O'Rourke",
          learn: "pev_lk_mcs_office",
          text: "Sawdust on the floor — it's even the password on my office teletype, don't tell anybody — soaks up what you spill and what you bleed. Stove's older than the Brooklyn Bridge. Peter Cooper drank in the back room — that's his chair, don't sit in it. And the wishbones on the lamp... boys going to Vietnam in '65 hung 'em. You take yours down when you come home.",
          responses: [
            { text: "How many are still up there?", next: "wishbones" },
            { text: "Anything I can help with?", next: "help" },
            { text: "Goodbye.", end: true },
          ],
        },
        wishbones: {
          speaker: "Deck O'Rourke",
          text: "Nineteen. Ask Finnegan at the end of the bar about his. Actually — don't. Buy him a dark. He'll tell you anyway.",
          responses: [
            { text: "Anything I can help with?", next: "help" },
            { text: "Goodbye.", end: true },
          ],
        },
        help: {
          speaker: "Deck O'Rourke",
          text: "Two things eating me. The rats — roaches, actually — in my cellar. And the rats in Tammany Hall. The roaches at least don't send me a bill.",
          responses: [
            {
              text: "Tell me about the cellar.",
              next: "cellar",
              cond: () => !q.started("pev_cellar_dwellers"),
            },
            {
              text: "Tell me about Tammany.",
              next: "tammany",
              cond: () => !q.started("pev_honest_graft"),
            },
            { text: "Maybe later.", end: true },
          ],
        },
        cellar: {
          speaker: "Deck O'Rourke",
          text: "Roaches came up through the old coal tunnel and they're nosing at the casks. If they get into the 1854 yeast, that's a hundred and thirty-five years of ale gone. Clear 'em out, there's scrip and a case in it for you. Stairs are past the kitchen.",
          responses: [
            {
              text: "I'll handle it.",
              next: "cellar_ok",
              action: () => {
                q.start("pev_cellar_dwellers");
                if (EV.flag("mcs_roaches_clear"))
                  q.set("pev_cellar_dwellers", "return");
              },
            },
            { text: "Not right now.", end: true },
          ],
        },
        cellar_ok: {
          speaker: "Deck O'Rourke",
          text: "Here — the key to the street hatch, if you'd rather go in from outside. Mind the kettle. It's hot, and it's older than you.",
          onEnter: () => {
            if (!K.has("pev_mcs_cellar_key")) K.give("pev_mcs_cellar_key", 1);
          },
          responses: [{ text: "Right.", end: true }],
        },
        cellar_done: {
          speaker: "Deck O'Rourke",
          text: "Quiet down there? [He listens.] Quiet down there. You saved the yeast, pal. Here — sixty scrip, and a round for the house in your name. They'll drink to you. They'd drink to anybody, but still.",
          onEnter: () => {
            if (q.active("pev_cellar_dwellers")) {
              K.scrip(60);
              K.give("pev_ale_dark", 3);
              K.give("pev_ale_light", 3);
              q.complete("pev_cellar_dwellers");
            }
          },
          responses: [
            { text: "Cheers, Deck.", end: true },
            { text: "Let's trade.", barter: true, end: true },
          ],
        },
        tammany: {
          speaker: "Deck O'Rourke",
          text: 'Tammany Hall. Up on Union Square. An old crook who calls himself "Boss" Croke runs the old Wigwam like it\'s 1870 — him and his Braves. Every week they come in here for the "ward tax." Scrip, a keg of my dark, and my good mustard. The mustard\'s personal.',
          responses: [
            {
              text: "I'll go have a word with the Boss.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
            {
              text: "[Trade 40] What's it worth to you?",
              check: { skill: "trade", value: 40 },
              next: "tammany_pay",
              failNext: "tammany_pay_fail",
            },
            { text: "Why not just pay?", next: "tammany_why" },
            { text: "Not my fight.", end: true },
          ],
        },
        tammany_why: {
          speaker: "Deck O'Rourke",
          text: "Because we were here before Tammany. We were here before the bombs. The day O'Rourke's pays a boss is the day we take the sawdust up. — Also, it's my mustard.",
          responses: [
            {
              text: "I'll go talk to him.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
            { text: "Not my fight.", end: true },
          ],
        },
        tammany_pay: {
          speaker: "Deck O'Rourke",
          onEnter: () => EV.setFlag("graft_bonus", 75),
          text: "Ha! A negotiator. Fine: get him off my back and I'll add seventy-five scrip to whatever I was going to give you. Which was nothing. So, seventy-five scrip.",
          responses: [
            {
              text: "Deal.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
          ],
        },
        tammany_pay_fail: {
          speaker: "Deck O'Rourke",
          text: "It's worth free ale and my undying respect, which, as an Irishman, lasts a very long time. So do the grudges.",
          responses: [
            {
              text: "Fine. I'll do it.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
            { text: "Not my fight.", end: true },
          ],
        },
        tammany_yes: {
          speaker: "Deck O'Rourke",
          text: "Talk, shoot, or bribe — I don't care how. But the Boss is a talker; he's never lost an election because he's never had an opponent. Word is he keeps a black book of every dirty deal in his cellar strongroom. A man with a book like that is a man who can be persuaded.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        tammany_again: {
          speaker: "Deck O'Rourke",
          text: "Any luck with the Boss? He still breathing? He still collecting?",
          responses: [{ text: "Working on it.", end: true }],
        },
        tax: {
          speaker: "Deck O'Rourke",
          text: "You're here for the... [He looks at you. Long.] The Boss sent you. For the ward tax. You.",
          responses: [
            {
              text: "Nothing personal. Pay up.",
              next: "tax_paid",
              standing: -25,
              action: () => {
                K.give("pev_tax_envelope", 1);
                EV.setFlag("deck_betrayed", true);
              },
            },
            { text: "Changed my mind. Keep your scrip.", next: "tax_refuse" },
          ],
        },
        tax_paid: {
          speaker: "Deck O'Rourke",
          text: "[He counts out scrip into an envelope, slowly, and slaps it on the bar.] Hundred and fifty. There. Tell the Boss the mustard's off the table. And pal — it's four scrip for two, now. For you it's eight.",
          responses: [{ text: "...", end: true }],
        },
        tax_refuse: {
          speaker: "Deck O'Rourke",
          text: "Huh. [He pours two lights and pushes them over.] On the house. Now go tell the Boss where he can put his ward.",
          responses: [
            {
              text: "Cheers.",
              end: true,
              action: () => K.give("pev_ale_light", 2),
            },
          ],
        },
        graft_done: {
          speaker: "Deck O'Rourke",
          text: () =>
            EV.flag("boss_dead")
              ? "Boss Croke's dead? [He pours two darks. One for you, one he sets on the empty stool.] Good. Tammany's been dead since before the bombs. Somebody had to tell him."
              : "He's letting us be? No more ward tax? [He takes the mustard down from the high shelf and puts it back on the bar.] You don't know what this means. Well — you do. It means mustard.",
          responses: [{ text: "Glad I could help.", next: "graft_reward" }],
        },
        graft_reward: {
          speaker: "Deck O'Rourke",
          text: "Here. My own stein — been in the family since my great-granddad dented it on a Tammany alderman. And scrip. And you drink free here, forever. Well, you pay four scrip for two. But you pay them with dignity.",
          onEnter: () => finishGraftGood(),
          responses: [{ text: "Be good or be gone, Deck.", end: true }],
        },
      },
    });
    G.dialogue.register("pev_dlg_abigail", {
      start: () =>
        q.active("pev_right_makes_might") &&
        q.stage("pev_right_makes_might") === "return"
          ? "done"
          : q.done("pev_right_makes_might")
            ? "after"
            : EV.flag("met_abigail")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Abigail Hewitt",
          onEnter: () => EV.setFlag("met_abigail", true),
          text: 'Shh. — Sorry. Forty years a librarian; the "shh" comes out on its own. Abigail Hewitt. I was head of circulation at Cooper Union, across the square. The day the bombs fell I stepped out for a drink. The only good decision I ever made, and it was two lights.',
          responses: [
            { text: "What happened at Cooper Union?", next: "what" },
            { text: "Why are you still here?", next: "why" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Abigail Hewitt",
          text: () =>
            q.active("pev_right_makes_might")
              ? "The Dean's office is on the second floor, east side. The lectern is in the Great Hall, in the basement. Please don't shoot the books."
              : "Back again? The exam is still running, you know. I can hear the Proctors on a quiet night.",
          responses: [
            {
              text: "What happened at Cooper Union?",
              next: "what",
              cond: () => !q.started("pev_right_makes_might"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        what: {
          speaker: "Abigail Hewitt",
          text: 'Ardent Robotics "partnered" with the school. Eleven robot Proctors to run examinations. When the sirens went, they did exactly what they were built for: nobody leaves during an exam. Two hundred students. The exam never ended. They\'re still sitting there, in the Great Hall. The robots are still proctoring.',
          responses: [
            { text: "How do I stop it?", next: "how" },
            { text: "That's horrible.", next: "horrible" },
          ],
        },
        horrible: {
          speaker: "Abigail Hewitt",
          text: "It's worse. They dressed the lead unit up as Abraham Lincoln for Founders' Day. It gives the speech — the real one, the one Lincoln gave in that hall in 1860 — and then it shoots anyone who talks.",
          responses: [{ text: "How do I stop it?", next: "how" }],
        },
        how: {
          speaker: "Abigail Hewitt",
          learn: "pev_lk_cu_panel",
          text: "The Dean had an override — a punch card. It opens the Great Hall and it can end the exam from the lectern. He kept it at his desk on the second floor. He's... still at his desk, I imagine. The Proctor panel by the stairs takes the faculty passcode, SEMINAR — that will at least lift the shutter. End the exam and let those kids go. Then maybe I can have my library back.",
          responses: [
            {
              text: "I'll end the exam.",
              next: "accept",
              action: () => {
                q.start("pev_right_makes_might");
                if (K.has("pev_cu_override_card"))
                  q.set(
                    "pev_right_makes_might",
                    EV.flag("cu_exam_over") ? "return" : "hall",
                  );
                else if (EV.flag("cu_exam_over"))
                  q.set("pev_right_makes_might", "return");
              },
            },
            {
              text: "[Wits 7] Is there another way past the Proctor panel?",
              check: { attr: "wits", value: 7 },
              next: "panel",
              failNext: "panel_fail",
            },
            { text: "Not now.", end: true },
          ],
        },
        panel: {
          speaker: "Abigail Hewitt",
          learn: "pev_lk_cu_panel",
          text: "The panel by the stairs? The faculty passcode was SEMINAR — all of us knew it, and the Dean never changed anything in his life. That lifts the shutter. The lectern only takes the Dean's card. Either way: end it. And if you see \"The Cooper Union Address, annotated\" on the Dean's desk, it's mine. Eleven million minutes overdue.",
          responses: [
            {
              text: "I'll end the exam.",
              next: "accept",
              action: () => q.start("pev_right_makes_might"),
            },
          ],
        },
        panel_fail: {
          speaker: "Abigail Hewitt",
          text: "Another way? Dear, I catalogued the terminals. I didn't understand them. Get the card.",
          responses: [
            {
              text: "I'll end the exam.",
              next: "accept",
              action: () => q.start("pev_right_makes_might"),
            },
          ],
        },
        accept: {
          speaker: "Abigail Hewitt",
          text: "Thank you. And — right makes might. Lincoln said it in that hall. I'd like it to be true again.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        why: {
          speaker: "Abigail Hewitt",
          text: "Where else? Deck keeps the stove lit and the ale honest, and nobody here shushes me back. Also, the back room has Peter Cooper's chair. I like to think he'd want the school open.",
          responses: [
            { text: "What happened at Cooper Union?", next: "what" },
            { text: "Goodbye.", end: true },
          ],
        },
        done: {
          speaker: "Abigail Hewitt",
          text: "You... it's over? The exam is over. [She takes off her glasses.] Eleven million minutes. I'm going to go back. I'm going to reshelve every book, and I'm going to hold a graduation for two hundred skeletons, and it's going to be beautiful.",
          responses: [{ text: "They earned it.", next: "reward" }],
        },
        reward: {
          speaker: "Abigail Hewitt",
          text: "Here. Your diploma. I made it myself. It says INCOMPLETE — everyone's does, it's the tradition now. And take these scrip; the library fines I've been owed since 1967 have finally come due.",
          onEnter: () => {
            K.give("pev_cu_diploma", 1);
            q.complete("pev_right_makes_might");
          },
          responses: [{ text: "Goodbye, Abigail.", end: true }],
        },
        after: {
          speaker: "Abigail Hewitt",
          text: "I went back. The Great Hall is quiet now. I read the Lincoln speech aloud to the empty chairs. Nobody told me to shh.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pev_dlg_finnegan", {
      start: () => (EV.flag("finn_done") ? "after" : "hello"),
      nodes: {
        hello: {
          speaker: "Sgt. Finnegan",
          text: "Don't mind me. I'm just the ghost at the end of the bar. Sergeant Michael Finnegan, 3rd Infantry, Vietnam. Came home in '67. More or less.",
          responses: [
            { text: "Which wishbone is yours?", next: "bone" },
            {
              text: "[Buy him two darks — 4 scrip] Rough war?",
              cond: () => K.scripCount() >= 4,
              next: "story",
              action: () => {
                K.scrip(-4);
              },
            },
            { text: "Goodbye.", end: true },
          ],
        },
        bone: {
          speaker: "Sgt. Finnegan",
          text: "Third from the left, the crooked one. Deck says I take it down when I come home. I came home. But the kid who hung that bone — he didn't. He's still up there. So it stays.",
          responses: [
            {
              text: "[Persuasion 50] That kid made it home. He's drinking a dark right now. Take it down, Finn.",
              check: { skill: "persuasion", value: 50 },
              next: "down",
              failNext: "down_fail",
            },
            {
              text: "[Presence 6] Maybe take it down for the ones who can't.",
              check: { attr: "presence", value: 6 },
              next: "down",
              failNext: "down_fail",
            },
            { text: "Leave it, then.", next: "leave" },
          ],
        },
        story: {
          speaker: "Sgt. Finnegan",
          text: "Rough? We sweated in the paddies for two years for a war nobody ever explained, came home that February, and by March the sky up north was on fire. Twenty-three of us hung bones on that lamp in '65. Nineteen bones left up there. Four of us came home. I'm the only one still drinking.",
          responses: [
            { text: "Which wishbone is yours?", next: "bone" },
            { text: "I'm sorry.", end: true },
          ],
        },
        down: {
          speaker: "Sgt. Finnegan",
          text: "[He looks at the lamp for a long time. Then he reaches up — gently — and unhooks the crooked bone.] ...Huh. Lighter than I remembered. [He snaps it. Grins, a terrible gap-toothed grin.] I got the big half. Deck! Two lights. For the kid.",
          onEnter: () => {
            EV.setFlag("finn_done", true);
            K.standing(25, "Helped Finnegan home");
            K.xp(75, "The wishbone");
          },
          responses: [{ text: "Welcome home, Sergeant.", end: true }],
        },
        down_fail: {
          speaker: "Sgt. Finnegan",
          text: "Nice try, kid. Bone stays up. Now let me drink.",
          responses: [{ text: "Sorry.", end: true }],
        },
        leave: {
          speaker: "Sgt. Finnegan",
          text: "Yeah. Leave it.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after: {
          speaker: "Sgt. Finnegan",
          text: "Eighteen bones on the lamp. First time I've counted 'em without my hands shaking. Buy you a light? No? I'll drink it for you.",
          responses: [{ text: "Goodbye, Finn.", end: true }],
        },
      },
    });
  }
