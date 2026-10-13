// play-inline-192 08 — end
// Lines 2135-2477 of readable/play-inline-192.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "pv_pastrami_sandwich",
      type: "aid",
      name: "Pastrami on Rye",
      weight: 0.5,
      value: 30,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [60, 10], attrs: { brawn: 1 }, duration: 300 },
      desc: "Hand-cut, brined for eleven days, smoked, steamed, stacked so high the bread gives up. Old-world recipe, roach-free (mostly). +1 Brawn while it lasts.",
    });
    K.defineItem({
      id: "pv_egg_cream",
      type: "aid",
      name: "Egg Cream",
      weight: 0.5,
      value: 12,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { hpOverTime: [15, 6] },
      desc: "Contains neither egg nor cream. Contains chocolate syrup, seltzer and something from a pack ox. A New York miracle.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pv_what_shes_having",
        name: "Send a Salami",
        giver: "Mags Kowalczyk",
        location: "Village Vanguard",
        desc: "Mags, who runs the bar at the Village Vanguard, wants to put real food back on the menu. Katz's Delicatessen on Houston Street kept a family brine ledger — the pastrami recipe — in the basement office. The basement is now a giant roach kingdom.",
        stages: [
          {
            id: "ledger",
            text: "Recover the brine ledger from the basement office of Katz's Delicatessen.",
            markers: [
              () => {
                const a = PV.anchor("katz", "ledger");
                return a
                  ? { x: a.x, z: a.z, y: a.y, label: "Brine Ledger" }
                  : null;
              },
            ],
          },
          {
            id: "wh_queen",
            text: "(Optional) Kill the Roach Queen nesting in Katz's basement.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.active("pv_what_shes_having"),
            doneIf: () => !!PV.flag("queen_dead"),
          },
          {
            id: "wh_cellar",
            text: "(Optional) Clear the giant roaches out of the Vanguard's service tunnel.",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("vv_roach_asked"),
            doneIf: () => !!PV.flag("vv_roaches_clear"),
          },
          {
            id: "return",
            text: "Bring the brine ledger to Mags at the Village Vanguard.",
            markers: [{ npc: "pv_dot", label: "Mags" }],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pv_dlg_dot", {
      start: () =>
        K.has("pv_q_brine_ledger") && K.q.active("pv_what_shes_having")
          ? "ledger"
          : K.q.done("pv_what_shes_having")
            ? "after"
            : PV.flag("met_dot")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Mags Kowalczyk",
          onEnter: () => PV.setFlag("met_dot", true),
          text: "Welcome to the Vanguard, hon. Two-drink minimum, no guns on the bandstand, and if you talk during the piano solo the robots take it personal. What'll it be?",
          responses: [
            { text: "Show me what you're pouring.", barter: true, end: true },
            { text: "Robots? Playing jazz?", next: "robots" },
            { text: "Any work going?", next: "work" },
            {
              text: "Something wrong in the cellar?",
              next: "cellar",
              cond: () => !PV.flag("vv_roaches_clear"),
            },
            {
              text: "Carmen Medina says the drinks are on you now.",
              next: "rosa",
              cond: () =>
                PV.flag("tombs_prisoners") === "freed" &&
                !PV.flag("rosa_drinks"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Mags Kowalczyk",
          text: "Back again. Sit anywhere, they're all bad seats in a triangle.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "About that recipe...",
              next: "work",
              cond: () => !K.q.started("pv_what_shes_having"),
            },
            {
              text: "Something wrong in the cellar?",
              next: "cellar",
              cond: () =>
                !PV.flag("vv_roaches_clear") && !PV.flag("vv_roach_asked"),
            },
            {
              text: "The tunnel's clear. No more roaches.",
              next: "cellar_done",
              cond: () =>
                !!PV.flag("vv_roaches_clear") && !PV.flag("vv_roach_paid"),
            },
            {
              text: "Carmen Medina says the drinks are on you now.",
              next: "rosa",
              cond: () =>
                PV.flag("tombs_prisoners") === "freed" &&
                !PV.flag("rosa_drinks"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        robots: {
          speaker: "Mags Kowalczyk",
          text: "The Tin Man Trio. Sir Hi-Hat on drums, Ivory on the keys, Low Tide on bass. Old Max bought 'em to sweep up; they taught themselves the book. They've played every night since the bombs. Nobody's had the heart to tell 'em the audience changed.",
          responses: [
            { text: "Any work going?", next: "work" },
            { text: "Goodbye.", end: true },
          ],
        },
        work: {
          speaker: "Mags Kowalczyk",
          text: "You know what this city's missing? Pastrami. Real pastrami, like Katz's on Houston. Old Katz family kept a brine ledger — the recipe, eleven days of it — in the basement office. Bring it here and I'll open a kitchen people cross the river for. Fair warning: the roaches in that basement have a queen. A big one.",
          responses: [
            {
              text: "I'll get your recipe.",
              next: "accept",
              action: () => K.q.start("pv_what_shes_having"),
            },
            {
              text: "[Presence 6] What's in it for me?",
              check: { attr: "presence", value: 6 },
              next: "pay",
              failNext: "pay_fail",
            },
            { text: "Not my kind of job.", end: true },
          ],
        },
        pay: {
          speaker: "Mags Kowalczyk",
          text: "Two hundred scrip, a sandwich with your name on it — the first three, actually — and free drinks till the robots quit. Which is never.",
          onEnter: () => PV.setFlag("dot_bonus", 50),
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => K.q.start("pv_what_shes_having"),
            },
          ],
        },
        pay_fail: {
          speaker: "Mags Kowalczyk",
          text: "Sandwiches, hon. That's what's in it for you. You look like you could use one.",
          responses: [
            {
              text: "Fine. I'll do it.",
              next: "accept",
              action: () => K.q.start("pv_what_shes_having"),
            },
            { text: "Maybe later.", end: true },
          ],
        },
        accept: {
          speaker: "Mags Kowalczyk",
          text: "Katz's is on Houston, east side, the corner with the big sign. The office is in the basement past the freezer. And whatever you do, don't order the roach.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        cellar: {
          speaker: "Mags Kowalczyk",
          text: "Something's chewing the wires in the service tunnel under the club. Every time the lights flicker, Ivory drops a chord. Clear it out and I'll owe you fifty scrip. Tunnel's through the staff door, down the stairs.",
          onEnter: () => PV.setFlag("vv_roach_asked", true),
          responses: [{ text: "I'll take a look.", end: true }],
        },
        cellar_done: {
          speaker: "Mags Kowalczyk",
          text: "I heard. Well — Ivory hasn't missed a chord all night. Here. Fifty scrip and a drink on the house.",
          onEnter: () => {
            PV.setFlag("vv_roach_paid", true);
            K.scrip(50);
            K.give("pv_egg_cream", 1);
            K.xp(60, "Pest control");
          },
          responses: [{ text: "Thanks, Mags.", end: true }],
        },
        ledger: {
          speaker: "Mags Kowalczyk",
          text: "Is that — oh, look at that handwriting. \"Eleven days. Don't rush the brisket, don't rush the customer.\" Hon, you just saved New York's lunch.",
          responses: [
            {
              text: "Enjoy it, Mags.",
              next: "after",
              action: () => finishLedger(),
            },
          ],
        },
        after: {
          speaker: "Mags Kowalczyk",
          text: "Kitchen's open! Well — it will be, in eleven days. Take these. And come back hungry: first sandwich is always on the house for you.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "Carmen Medina says the drinks are on you now.",
              next: "rosa",
              cond: () =>
                PV.flag("tombs_prisoners") === "freed" &&
                !PV.flag("rosa_drinks"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        // round 2: the Jailbreak pay-off — Carmen sings here again (the freed prisoners settle in the Vanguard yard)
        rosa: {
          speaker: "Mags Kowalczyk",
          text: "You're the one who walked Carmen out of the Tombs? Hon, she's been back on that bandstand every night since, and the robots finally have somebody to follow. Drinks are on the house. Forever. That's not a figure of speech.",
          onEnter: () => {
            PV.setFlag("rosa_drinks", true);
            if (K.itemExists("whiskey")) K.give("whiskey", 2);
            K.give("pv_egg_cream", 2);
            K.scrip(75);
            K.xp(50, "A song for the Tombs");
            K.standing(10, "Carmen is singing again");
          },
          responses: [{ text: "Tell her to sing the happy one.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_hattie", {
      start: () => (PV.flag("met_hattie") ? "again" : "hello"),
      nodes: {
        hello: {
          speaker: "Midge Sparks",
          onEnter: () => PV.setFlag("met_hattie", true),
          text: "Midge Sparks, scrap and sundries. If it's got a screw in it, I'll buy it. If it's got a screw loose, Mags'll hire it. What do you need?",
          responses: [
            { text: "Let's see what you've got.", barter: true, end: true },
            {
              text: "How did the Vanguard end up a settlement?",
              next: "history",
            },
            {
              text: "[Mechanics 40] Your fuse box is sparking. Want me to look?",
              check: { skill: "mechanics", value: 40 },
              next: "fix",
              failNext: "fix_fail",
              cond: () => !PV.flag("hattie_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Midge Sparks",
          text: "Back for more junk? Good. Junk's the only thing this city makes any more.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "[Mechanics 40] That fuse box still sparking?",
              check: { skill: "mechanics", value: 40 },
              next: "fix",
              failNext: "fix_fail",
              cond: () => !PV.flag("hattie_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        history: {
          speaker: "Midge Sparks",
          text: "Music. Folks followed the sound down Seventh Avenue — three robots playing to nobody. Mags put up a fence to keep the Maniacs from following it too. Then somebody sold water, somebody sold smokes, and now we're a town. Don't tell the raiders.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        fix: {
          speaker: "Midge Sparks",
          text: "Huh. You rewired it with a paper clip and a bad attitude. That's my kind of engineering. Here — on the house, and I'll knock a little off your next haul.",
          onEnter: () => {
            PV.setFlag("hattie_fixed", true);
            if (K.itemExists("scrap_electronics"))
              K.give("scrap_electronics", 2);
            K.scrip(40);
            K.xp(40, "Fixed Midge's fuse box");
          },
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        fix_fail: {
          speaker: "Midge Sparks",
          text: "Whoa, whoa — hands OFF. That one bites. Come back when you know which wire's the angry one.",
          responses: [{ text: "Fair enough.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_hihat", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Sir Hi-Hat",
          text: "Good evening, sir! The Tin Man Trio thanks you for your patronage. We are currently in our forty-nine-thousandth consecutive set. Requests are welcome. Requests are ignored, but welcome.",
          responses: [
            { text: "How long have you been playing?", next: "long" },
            { text: "Play something happy.", next: "happy" },
            { text: "Goodbye.", end: true },
          ],
        },
        long: {
          speaker: "Sir Hi-Hat",
          text: 'Since a Friday night in March 1967, at 9:04 PM. Management said "one more set." Management has not yet said "that\'s enough." I am a patient machine, but I confess the cymbals are getting thin.',
          responses: [{ text: "Keep swinging.", end: true }],
        },
        happy: {
          speaker: "Sir Hi-Hat",
          text: "Sir, this IS the happy one. You should hear the sad one. Actually, you should not. Ivory cried oil for a week.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
