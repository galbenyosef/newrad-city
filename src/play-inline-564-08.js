// play-inline-564 08 — next
// Lines 2237-2558 of readable/play-inline-564.pretty.js (statement-aligned).
  L.hook("register", function () {
    const censusCheck = { attr: "wits", value: 8 };
    const censusLine =
      "Your soldiers were born after 1967, Colonel. Not one of them is on the rolls. Neither is Hale.";
    const crRose = () =>
      roseHere() &&
      !L.flag("ms_rose_hidden") &&
      !L.flag("ms_rose_detained") &&
      !L.flag("ms_rose_shield_tried");
    const confronting = () => Q.isActive("mq25") || Q.isActive("mq06");
    const burned = () =>
      L.flag("ms_microfilm") === "burned" ||
      L.flag("li_un_tapes_to") === "burned";
    const mainResponses = () => [
      {
        text: "[Presence 6] Eyes on me, Colonel. She's my guide. She was born in Hoboken and she's never been near your father's station.",
        cond: () => crRose(),
        check: { attr: "presence", value: 6 },
        next: "shield_ok",
        failNext: "shield_fail",
      },
      { text: '"Unlisted." You mean people.', next: "people" },
      {
        text: "There are no rolls any more, Colonel. The microfilm is gone. I burned it.",
        cond: burned,
        next: "rolls_burned",
      },
      {
        text: censusLine,
        check: censusCheck,
        next: "genome",
        failNext: "genome_fail",
        cond: () => !burned(),
      },
      {
        text: "[Persuasion 75] Stand down, Colonel. Nobody else has to die today.",
        check: { skill: "persuasion", value: 75 },
        next: "surrender",
        failNext: "nosurrender",
      },
      {
        text: "You're right. Let's light the torch together.",
        next: "ally_offer",
      },
      { text: "Enough talk.", next: "fight" },
    ];
    L.dialogue("dlg_lib_crane", {
      start: () => {
        if (L.flag("crane_surrendered")) return "surrendered";
        if (L.flag("crane_ally")) return "ally";
        if (L.flag("crane_fight")) return "fighting";
        if (!confronting()) return "early";
        if (Q.isActive("mq06")) Q.complete("mq06");
        return faction() === "continuity" && !L.flag("con_hostile")
          ? "con"
          : "hello";
      },
      nodes: {
        early: {
          speaker: "Colonel Crane",
          text: "You are on federal property without an appointment, and I am in no mood to make one. Go back to the city, sleeper. You will come back properly. They always do.",
          responses: [{ text: "[Leave.]" }],
        },
        hello: {
          speaker: "Colonel Crane",
          text: () =>
            "That's far enough. [The black helmet tilts, lamps glowing.] Colonel Augustus Crane, United States Government, commanding Liberty Station. And you are the second sleeper, with the key, and — yes, I can hear it humming — the core as well." +
            (faction() === "covenant"
              ? " I see you've also brought the boilers from Rockefeller. Less thoughtful."
              : ""),
          responses: [
            { text: "Where are Zeke and Dr. Calloway?", next: "zeke" },
            { text: "What do you want, Colonel?", next: "want" },
            { text: "Enough talk.", next: "fight" },
          ],
        },
        zeke: {
          text: "Marlow is in what the Park Service once called a gift shop. Unharmed. He has spent weeks lecturing my men on water pressure; three of them have requested transfers, on the correct form. Your Dr. Calloway is in a cell in the old fort. She rowed out here to ask me what I thought I was doing. I told her.",
          responses: [{ text: "What do you want, Colonel?", next: "want" }],
        },
        want: {
          text: () =>
            "The same thing you want, I suspect: a clean sky. The difference between us is that I have read the fine print. Directive 7-A is surgery. Everyone counted in 1967 breathes clean air. Everyone else simply... stops. No more unlisted children. One generation, and the country is the country again. " +
            "[He takes his helmet off. A tired, lined, grey face.] I was eleven when the bombers came, and twelve when a woman with a box of matches burned my father's station with him inside. Grand Central, the Relief Station, the fifth of March, 1968. They wrote her up as dead. I have never believed it. Nor that the baby she did it for died." +
            (roseHere() && !L.flag("ms_rose_detained")
              ? " [His eyes go to the leather cuff on Rose's wrist, and stay there.]"
              : ""),
          responses: mainResponses(),
        },
        shield_ok: {
          text: "[A long look. Then he puts the helmet back on.] Hoboken. Of course. Forgive me, miss. An old man sees his father's murderer in every shadow with a wrist. [He turns back to you.] Where were we.",
          onEnter() {
            L.setFlag("ms_rose_hidden");
            L.setFlag("ms_rose_shield_tried");
            L.xp(40, "Presence: Hoboken");
          },
          responses: mainResponses(),
        },
        shield_fail: {
          text: "[He doesn't look away from the cuff.] Hoboken. [Quietly, to the sergeant.] Rourke. Detain the young lady. Gently. I want to see that wrist in good light.",
          onEnter() {
            L.setFlag("ms_rose_detained");
            L.setFlag("ms_rose_shield_tried");
            const M = ms();
            if (M) {
              M.rose.say("Don't, Dad. Don't. Let them. I'll be fine.", 5);
              M.rose.place("at", SPOTS.casemate());
            }
          },
          responses: mainResponses(),
        },
        people: {
          text: () =>
            "I mean the future, " +
            volunteer() +
            ". Someone has to decide what it looks like. It might as well be someone with a plan, a uniform and the correct forms.",
          responses: [
            {
              text: "[Persuasion 75] Stand down, Colonel.",
              check: { skill: "persuasion", value: 75 },
              next: "surrender",
              failNext: "nosurrender",
            },
            {
              text: "There are no rolls any more, Colonel. I burned the microfilm.",
              cond: burned,
              next: "rolls_burned",
            },
            {
              text: censusLine,
              check: censusCheck,
              next: "genome",
              failNext: "genome_fail",
              cond: () => !burned(),
            },
            { text: "Enough talk.", next: "fight" },
          ],
        },
        rolls_burned: {
          text: "[He stares at you.] The microfilm. From the UN strongroom. [His hand finds the edge of the map table.] Then Seven-A runs on nothing. A sieve with no holes. ...Twenty-two years. [He sits down, which you suspect he has not done in front of his men in a decade.] Sergeant. Stand the men down. There is nothing left to guard.",
          onEnter() {
            L.setFlag("crane_genome");
            L.xp(120, "The rolls are gone");
          },
          responses: [
            { text: "It's over, Colonel.", action: () => craneSurrender() },
          ],
        },
        genome: {
          text: "[A long silence. The helmet lamps flicker.] ...Rourke was born in '70. Dunn in '72, in the old shelter under Fourteenth Street. Hale... [Another silence.] The rolls closed in March of 1967. Every man on this island who would ever outlive me. We would have counted ourselves out of history. ...Sergeant. Stand the men down.",
          onEnter() {
            L.xp(100, "Wits: Not on the rolls");
            L.setFlag("crane_genome");
          },
          responses: [
            { text: "It's over, Colonel.", action: () => craneSurrender() },
          ],
        },
        genome_fail: {
          text: "Clever. Wrong, but clever. Enlisted personnel are enrolled by Supplementary Schedule C. I signed it myself. I always sign it myself.",
          responses: [
            {
              text: "[Persuasion 75] Stand down, Colonel.",
              check: { skill: "persuasion", value: 75 },
              next: "surrender",
              failNext: "nosurrender",
            },
            { text: "Enough talk.", next: "fight" },
            { text: "Then let's do it your way.", next: "ally_offer" },
          ],
        },
        surrender: {
          text: "[He is quiet for a long time.] You sound like him. Marlow. \"Nobody else has to die.\" [He lowers his rifle.] They told me men like my father would fix it. Perhaps we're not the men for it. ...All units, stand down. That is an order. Log it. [He holds out a ring of keys.] The locker and the safe. You'll want what's in them. I never did.",
          onEnter() {
            L.xp(100, "Persuasion: Stand down");
          },
          responses: [
            { text: "Thank you, Colonel.", action: () => craneSurrender() },
          ],
        },
        nosurrender: {
          text: () =>
            "Nobody else? " +
            volunteer() +
            ", EVERYONE else has been dying since 1967. I am the only one here with a plan to make it stop.",
          responses: [
            { text: "Then I'll stop you.", next: "fight" },
            { text: "Then let's do it your way.", next: "ally_offer" },
          ],
        },
        ally_offer: {
          text: "[For the first time, he smiles.] Good. Good man. The torch, then, with the Directive. I'll be right beside you. And my keys — take them; you'll want Marlow loose for the wiring. He built it, after all.",
          responses: [
            {
              text: "Yes, Colonel.",
              standing: -100,
              action: () => craneAlly(),
            },
            { text: "On second thought — no.", next: "fight" },
          ],
        },
        fight: {
          text: "Pity. Sergeant — the volunteer is to be taken alive. Everyone else is expendable. We'll do the paperwork afterwards.",
          onEnter() {
            craneFight();
          },
          responses: [{ text: "[Fight!]" }],
        },
        con: {
          speaker: "Colonel Crane",
          text: "The second sleeper, at last. Lieutenant Hale speaks highly of you, and she speaks highly of almost no one. You have the key, the core and the Directive. Walk with me to the torch. Load Directive 7-A, and history will write your name beside mine. In ink.",
          responses: [
            {
              text: "Yes, Colonel.",
              standing: -100,
              action: () => craneAlly(),
            },
            { text: "Tell me about your father first.", next: "want" },
            { text: "I'll program it — for everyone.", next: "betray" },
          ],
        },
        betray: {
          text: "[The helmet lamps narrow.] I was warned you might say that. Hale, of all people, warned me. ...Soldiers.",
          onEnter() {
            craneFight();
          },
          responses: [{ text: "[Fight!]" }],
        },
        surrendered: {
          text: () =>
            "I've given my men leave to go home. Wherever that is. [He looks up at the torch.] Do the right thing, " +
            volunteer() +
            ". I clearly wasn't going to.",
          responses: [{ text: "[Leave.]" }],
        },
        ally: {
          text: "The torch awaits. History awaits. I await, which I am not good at.",
          responses: [{ text: "[Leave.]" }],
        },
        fighting: {
          text: "[Crane is in no mood to talk.]",
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    L.dialogue("dlg_lib_zeke", {
      start: () => {
        if (L.flag("ms_torch") && Q.isComplete("mq28")) return "after";
        if (L.flag("ms_zeke_free") || L.flag("zeke_freed")) return "again";
        return Q.isActive("mq26") ? "free" : "notyet";
      },
      nodes: {
        notyet: {
          speaker: "Zeke Marlow",
          text: () =>
            first() +
            "? " +
            first().toUpperCase() +
            "! [An older man in a patched cryo suit, zip-tied to a display rack of souvenir torches.] Not yet, kid — not like this. Crane's men would shoot us both before the pier. Come back when the Colonel's dealt with.",
          responses: [{ text: "Hang on, Zeke." }],
        },
        free: {
          speaker: "Zeke Marlow",
          text: () =>
            first() +
            "? " +
            first().toUpperCase() +
            ". [He struggles up off a crate, zip-tied at the wrists.] Look at you. Thawed and walking. You came. You absolute knucklehead, you came." +
            (L.flag("crane_ally")
              ? " ...With HIM. Tell me you're not with him."
              : ""),
          responses: [
            {
              text: "[Cut the ties.] Happy to see you too, Zeke.",
              next: "freed",
            },
            {
              text: "We had a deal. Whoever wakes up first waits for the other one.",
              next: "freed",
            },
          ],
        },
        freed: {
          text: "Twenty-two years on ice, and I wake up to find they never switched it on. MY Array. I wired half of that thing in '66. A lung for the whole city. [He rubs his wrists.] And the Director — Calloway — they've got her in the old fort, in a casemate. The guard keeps the key on that hook. I've been staring at it for weeks. [He takes it down and presses it into your hand.]",
          onEnter() {
            if (!L.flag("ms_zeke_free")) {
              L.setFlag("ms_zeke_free");
              L.setFlag("zeke_freed");
              L.xp(100, "Found Zeke");
              L.standing(50, "Freed Zeke");
            }
            if (!L.has("ms_casemate_key")) L.give("ms_casemate_key", 1);
            if (at("mq26", "zeke")) Q.setStage("mq26", "calloway");
          },
          responses: [{ text: "Let's get her out." }],
        },
        again: {
          text: () =>
            Q.isActive("mq28")
              ? "Torch teletype. Six days on the tide, noon on Sunday. Whatever you choose — I'm proud of you. Even if you choose wrong. ESPECIALLY if you choose wrong; that's how I know you chose."
              : Q.isActive("mq26")
                ? "Calloway first. Then the locker. Then we talk about my Array."
                : "You know where to find me. The stool with my name scratched in it.",
          responses: [{ text: "Thanks, Zeke." }],
        },
        after: {
          text: () =>
            L.flag("ms_torch") === "selective"
              ? "[Zeke will not look at you. He is staring at the floor.]"
              : L.flag("ms_array_fired") === "reclamation"
                ? "Blue. It's BLUE. [He is crying and not hiding it.] I'm going to look at that sky until they throw me out."
                : "Noon on Sunday. Whatever happens, we're both still breathing, and that's more than most stories get. Come find me at the Oyster Bar. I'll buy. With your scrip, probably.",
          responses: [{ text: "See you at the Oyster Bar, Zeke." }],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // Test solvers (forced stage walk) + debug
  // ------------------------------------------------------------------
