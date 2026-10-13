// play-inline-582 03 — next
// Lines 568-823 of readable/play-inline-582.pretty.js (statement-aligned).
  QX.hook("register", function () {
    const R = "Lancer Rask";
    QX.dialogue("qx_dlg_rask", {
      start: () => {
        if (QX.flag("kd_robbed")) return "coward";
        if (QX.reached(QID, "done_saved")) return "after";
        if (!QX.flag("kd_freed"))
          return QX.flag("kd_met") ? "pinned2" : "pinned";
        return "leg";
      },
      nodes: {
        pinned: {
          speaker: R,
          onEnter: () => A.met(),
          text:
            "[An Iron Covenant Lancer in a scorched Mk I exo-rig sits propped against the scaffold, legs buried under a steel beam, gyrojet carbine across her lap. Her slit visor is pushed up.] " +
            "Civilian? Stay low. There are Maniacs working this block — three that I know of. Lancer Imogen Rask, Iron Covenant, Survey Detail Kestrel. " +
            "A Brute mortar round out of the east brought the scaffold down on me. Leg's broken, rig servos are fried, and I can't reach the transponder to switch it off. So every Maniac in Hell's Kitchen knows where lunch is.",
          responses: [
            {
              text: "I heard your distress pulse. Let's get you out of there.",
              next: "options",
            },
            { text: "Where's the rest of your detail?", next: "squad" },
            {
              id: "rask_rob",
              text: "(Cruel) That's a fine carbine. You won't be needing it.",
              next: "rob",
            },
          ],
        },
        pinned2: {
          speaker: R,
          text: "Still here. Still pinned. Still not panicking, for the record.",
          responses: [
            { text: "Let's try this again.", next: "options" },
            {
              id: "rask_rob2",
              text: "(Cruel) Hand over the carbine.",
              next: "rob",
            },
            { text: "I'll be back.", end: true },
          ],
        },
        squad: {
          speaker: R,
          text:
            "Lancer Vey and Lancer Brannock went for help at first light. Four days ago. Either Rockefeller said no, or they didn't make it to Rockefeller. " +
            "I'd rather not guess which while I'm sitting here.",
          responses: [
            { text: "Then let's not wait for them.", next: "options" },
          ],
        },
        options: {
          speaker: R,
          text: "That beam weighs as much as a pack ox. I tried. The rig tried. Got any ideas that don't involve a Rotorcraft?",
          responses: [
            {
              id: "rask_str",
              text: "Brace yourself. I'll lift it.",
              check: { attr: "brawn", value: 7 },
              next: "lift",
              failNext: "lift_fail",
            },
            {
              id: "rask_rep",
              text: "Your leg actuators are fine — it's the servo relay. I can bypass it, and your rig lifts the beam for you.",
              check: { skill: "mechanics", value: 45 },
              next: "servo",
              failNext: "servo_fail",
            },
            {
              id: "rask_exp",
              text: "A small shaped charge under the far end will kick it off you.",
              check: { skill: "explosives", value: 50 },
              next: "boom",
              failNext: "boom_fail",
            },
            {
              id: "rask_jack",
              text: "[Use the hydraulic bottle jack.]",
              cond: () => QX.has("qx_kd_jack"),
              next: "jack",
            },
            {
              text: "I can't shift it on my own. What else is there?",
              next: "jackhint",
              cond: () => !QX.has("qx_kd_jack"),
            },
            { text: "Hold on. I'll be back.", end: true },
          ],
        },
        lift: {
          speaker: R,
          onEnter: () => A.free("str"),
          text:
            "[You get your shoulder under the beam. Something in your back files a complaint. The beam lifts an inch — two — and she drags herself clear.] " +
            "...That was either very brave or very stupid. The Ledger has a word for both. I'll look it up later.",
          responses: [{ text: "You're out. Now, that leg.", next: "leg" }],
        },
        lift_fail: {
          speaker: R,
          text: "[The beam doesn't move. You do — backwards, onto the pavement.] Appreciate the effort. Let's not both end up under it.",
          responses: [
            { text: "Let me think of something else.", next: "options" },
          ],
        },
        servo: {
          speaker: R,
          onEnter: () => A.free("servo"),
          text:
            "[You pry the panel off her thigh plate and short the relay with a scaffold clip. The rig whines, then heaves the beam aside like a blanket.] " +
            'Hah! The Archivists said that relay was "not field-serviceable". I\'m putting you in my report.',
          responses: [{ text: "Now, about that leg.", next: "leg" }],
        },
        servo_fail: {
          speaker: R,
          text: "[Sparks. The rig twitches and slaps you with its own gauntlet.] ...Maybe leave the exo-rigs to the Archivists.",
          responses: [{ text: "Something else, then.", next: "options" }],
        },
        boom: {
          speaker: R,
          onEnter: () => A.free("boom"),
          text:
            "[A flat crack. The beam jumps off her legs and clangs into the gutter. Her ears are ringing; so are yours.] " +
            "WHAT? ...I SAID, THAT WAS A VERY PRECISE CHARGE. THANK YOU.",
          responses: [{ text: "YOU'RE WELCOME. NOW, YOUR LEG.", next: "leg" }],
        },
        boom_fail: {
          speaker: R,
          text: "Where exactly were you going to put that? No. Absolutely not. Not next to my knees.",
          responses: [{ text: "Fair. Something else.", next: "options" }],
        },
        jack: {
          speaker: R,
          onEnter: () => A.free("jack"),
          text:
            "[You seat the bottle jack under the beam and pump. Slowly, with a groan of old steel, it rises off her shins, and she hauls herself free.] " +
            "Twelve tons of good old American hydraulics. Where did you find that?",
          responses: [
            { text: "Tow truck down the street. Now, your leg.", next: "leg" },
          ],
        },
        jackhint: {
          speaker: R,
          onEnter: () => {
            QX.setFlag("kd_jack_hint");
            if (QX.active(QID)) QX.refresh(QID);
          },
          text: "There's a wrecked tow truck on Fortieth, just east of here — saw it on the way in. Tow trucks carry jacks. A bottle jack would lift this beam. Watch the Maniacs on the way.",
          responses: [{ text: "I'll find it.", end: true }],
        },
        leg: {
          speaker: R,
          text: "Out. Thank you. Leg's broken below the knee — clean break, I think, which is the only kind of good news this city does. I can't walk to Rockefeller on it. Not like this.",
          responses: [
            {
              id: "rask_stim",
              text: "[Give her a Rally Tonic.]",
              cond: () => QX.has(TONIC),
              next: "stim",
            },
            {
              id: "rask_med",
              text: "Bite down on this. I'm going to set it and splint it with a scaffold pole.",
              check: { skill: "medicine", value: 40 },
              next: "med",
              failNext: "med_fail",
            },
            {
              text: "I've got nothing to fix it with. Lean on me, I'll get you to the avenue.",
              next: "limp",
            },
          ],
        },
        stim: {
          speaker: R,
          onEnter: () => A.heal("stim"),
          text: "[The needle goes in through the gap at her knee. She hisses, then flexes her foot and laughs.] Street medicine. The Archivists hate it. I love it.",
          responses: [{ text: "Can you make it back?", next: "thanks" }],
        },
        med: {
          speaker: R,
          onEnter: () => A.heal("med"),
          text: "[One pull. She doesn't make a sound — through the bite guard, anyway. You lash the scaffold pole to her greave.] ...Good work. Clean, fast. You've done that before.",
          responses: [{ text: "Can you make it back?", next: "thanks" }],
        },
        med_fail: {
          speaker: R,
          text: "[You pull. It is the wrong direction. She makes a noise you will remember.] STOP. Stop. Let's... not do that again.",
          responses: [
            {
              text: "[Give her a Rally Tonic.]",
              cond: () => QX.has(TONIC),
              next: "stim",
            },
            { text: "Lean on me, then.", next: "limp" },
          ],
        },
        limp: {
          speaker: R,
          onEnter: () => A.heal("limp"),
          text:
            "[She hooks an arm over your shoulder and heaves up, all four hundred pounds of exo-rig, and takes a step. Then another.] " +
            "Hah. Hurts. Walks. I'll use a scaffold pole for a crutch from here. Rockefeller's only thirty blocks.",
          responses: [{ text: "Will you make it?", next: "thanks" }],
        },
        thanks: {
          speaker: R,
          text:
            "I'll make it. The Covenant doesn't pay debts in Scrip, but it pays them. Take my sidearm and the rockets — I've got the carbine. " +
            "And this. [She presses her service tag into your hand.] Show it at Rockefeller. Somebody will owe you a drink. Probably Oduya. He owes everyone.",
          responses: [
            { text: "Iron and oath, Lancer.", next: "bye" },
            { text: "Stay out from under scaffolding.", next: "bye" },
          ],
        },
        bye: {
          speaker: R,
          text: "Iron and oath. [She switches off the transponder with a click. The strobe dies.] Finally. That thing was driving me insane.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        rob: {
          speaker: R,
          text:
            "[She looks at you for a long moment. Then she unclips the carbine and holds it out, stock first.] Take it. I hope it's worth it. " +
            "When the Covenant finds my transponder, they'll find out who was here.",
          responses: [
            {
              text: "[Take the carbine and leave.]",
              action: () => A.rob(),
              end: true,
            },
            {
              text: "Forget it. I was joking. Let's get you out.",
              next: "options",
            },
          ],
        },
        coward: {
          speaker: R,
          text: [
            "Get out of my sight.",
            "You've got my carbine. What else do you want — my boots?",
            "Keep walking.",
          ],
          responses: [{ text: "[Leave.]", end: true }],
        },
        after: {
          speaker: R,
          text: "Rockefeller's that way. I've got it from here. Go on — somebody else in this city is under a beam.",
          responses: [{ text: "Take care, Lancer.", end: true }],
        },
      },
    });
  });
