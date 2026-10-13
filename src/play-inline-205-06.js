// play-inline-205 06 — next
// Lines 3977-4310 of readable/play-inline-205.pretty.js (statement-aligned).
  PF.dialogue("pf_dlg_pell", {
    start: () => {
      const st = PF.q.stage("pf_dust");
      if (PF.q.active("pf_dust") && st === "report") return "report";
      return PF.flag("tr_met") ? "again" : "first";
    },
    nodes: {
      first: {
        text: "Welcome to Trinity, child. Sanctuary is free: water from the pump, a pew to sleep on, and the Lord's own roof — mostly. Holes in it, but holy ones. I'm Reverend Josiah Penhallow. Rules are on the board by the door. Guns stay holstered. Maniacs are not parishioners.",
        onEnter() {
          PF.setFlag("tr_met", true);
        },
        responses: [
          {
            text: "How did you end up running a church in the ruins?",
            next: "history",
          },
          {
            text: "You look worried, Reverend.",
            next: "problem",
            cond: () => !PF.q.started("pf_dust"),
          },
          {
            text: "About the crypt...",
            next: "problem",
            cond: () =>
              PF.q.active("pf_dust") && PF.q.stage("pf_dust") === "talk",
          },
          {
            text: "[Donate 25 scrip] Bless me, Reverend.",
            cond: () => PF.inv.scrip() >= 25,
            action: () => {
              PF.inv.addScrip(-25);
              PF.setFlag("tr_blessed", (PF.flag("tr_blessed") || 0) + 1);
              PF.standing(10, "Donation to Trinity");
              try {
                G.player.heal(25);
              } catch (e) {
                /* ignore */
              }
            },
            next: "bless",
          },
          { text: "Goodbye, Reverend." },
        ],
      },
      again: {
        text: () =>
          PF.q.complete("pf_dust")
            ? "The nights are quiet now. I sleep. The Doc sleeps. Even Tobias sleeps, and Tobias hasn't slept since the Truman administration. God bless you."
            : "Back again. The door's always open. Mostly because we can't find the key to it.",
        responses: [
          {
            text: "About the scratching under the chancel...",
            next: "problem",
            cond: () =>
              !PF.q.started("pf_dust") ||
              (PF.q.active("pf_dust") && PF.q.stage("pf_dust") === "talk"),
          },
          {
            text: "I need the crypt key again.",
            cond: () =>
              PF.q.active("pf_dust") &&
              !PF.inv.count("pf_crypt_key") &&
              !PF.flag("tr_crypt_open"),
            action: () => PF.inv.add("pf_crypt_key", 1),
            next: "key_again",
          },
          { text: "Tell me about Trinity.", next: "history" },
          {
            text: "[Donate 25 scrip] Bless me, Reverend.",
            cond: () => PF.inv.scrip() >= 25,
            action: () => {
              PF.inv.addScrip(-25);
              PF.setFlag("tr_blessed", (PF.flag("tr_blessed") || 0) + 1);
              PF.standing(10, "Donation to Trinity");
              try {
                G.player.heal(25);
              } catch (e) {
                /* ignore */
              }
            },
            next: "bless",
            repeatable: true,
          },
          { text: "Goodbye." },
        ],
      },
      history: {
        text: "I was a deacon in Brooklyn when the bombs fell. Walked across the bridge in '82 with eleven people and a goat. Found this place standing when half the street around it wasn't — the spire's been the tallest thing on Wall Street twice now. Hamilton's out in the yard, you know. We keep his grave tidy. Man knew a thing or two about owing money.",
        responses: [
          { text: "Hamilton?", next: "hamilton" },
          {
            text: "Anything I can help with?",
            next: "problem",
            cond: () => !PF.q.started("pf_dust"),
          },
          { text: "Thanks, Reverend." },
        ],
      },
      hamilton: {
        learn: "pf_lk_tr_parish",
        text: "First Secretary of the Treasury. Built the whole machine — banks, credit, the national debt. People leave him scrip now. I think he'd have appreciated a currency you can find on the ground. The old Rector even made him the password on the vestry teletype: ALEXANDER. Read the parish records, if you like. They're mostly about drains.",
        responses: [{ text: "Fair enough.", next: "again" }],
      },
      problem: {
        text: "There is something under my chancel. Every night, after the lanterns are down: scratching. At the crypt gate, at the floor. The Doc says Maniacs. I say the crypt has been sealed since the Bombing, and the dead should stay where they're put. None of my people will go down. You, though... you have the look of someone who goes down into places.",
        responses: [
          {
            text: "I'll take a look.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
          { text: "What's in it for me?", next: "reward" },
          {
            text: "[Persuasion 40] A job like that is worth more than a blessing.",
            check: { skill: "persuasion", value: 40 },
            next: "haggle",
            failNext: "haggle_fail",
            cond: () => !PF.flag("tr_haggled"),
          },
          { text: "Not my problem." },
        ],
      },
      reward: {
        text: "Scrip — a hundred, all we've got in the poor box. And there's a thing in the vestry that belonged to the old Rector. A pistol. Engraved. Men of God shouldn't keep pistols. I keep it anyway. It's yours if you bring me quiet nights.",
        responses: [
          {
            text: "Deal. Give me the key.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
          { text: "I'll think about it." },
        ],
      },
      haggle: {
        text: "...You'd make a fine collection-plate man. All right — a hundred and fifty. The Lord will understand; the Doc won't.",
        onEnter() {
          PF.setFlag("tr_haggled", true);
        },
        responses: [
          {
            text: "Deal. Give me the key.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
        ],
      },
      haggle_fail: {
        text: "Child, I am a preacher in a ruin. You are negotiating with a man whose collection plate is a hubcap.",
        responses: [
          {
            text: "Fine. I'll do it.",
            action: () => {
              if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
              PF.q.advance("pf_dust", "talk", "key");
              PF.inv.add("pf_crypt_key", 1);
            },
            next: "key",
          },
          { text: "Forget it." },
        ],
      },
      key: {
        text: "Here. The gate's at the end of the west aisle, past the chancel. Take a lamp. Take a gun. Take... well, you know what you're doing. If you find anyone down there who was one of ours — be kind, if you can. Be quick, if you can't.",
        responses: [{ text: "I'll be back." }],
      },
      key_again: {
        text: "Lose things often? Here. That's the spare. There is no spare after the spare.",
        responses: [{ text: "Thanks." }],
      },
      bless: {
        text: "The Lord bless you and keep you, and keep your rads low and your tonic bottles full. [He sketches a cross in the air. You feel... slightly better.]",
        responses: [{ text: "Amen." }],
      },
      report: {
        text: () => {
          const how = PF.flag("tr_breach");
          const tail =
            how === "blast"
              ? "I heard the blast from up here. So did the Doc. So did Brooklyn."
              : how === "brace"
                ? "Braced with pew timber, you say? The pews have never been more useful."
                : "Hauled rubble with your own hands. That's a penance I'd not wish on a banker.";
          return (
            "It's quiet. First quiet night in a year, and I could hear it before you even came up the aisle. " +
            tail +
            " And the Sexton — Silas Cobb. I read his name in the old register. Forty-two souls. Now they rest."
          );
        },
        responses: [
          {
            text: "They're at rest now.",
            action: () => {
              PF.q.done("pf_dust");
              PF.inv.remove("pf_crypt_key", 1);
              if (PF.flag("tr_haggled")) PF.inv.addScrip(50);
              PF.news(
                "Word from Trinity Church on Wall Street: the Reverend says the crypt is quiet and the sanctuary is open to all. He also says to stop leaving scrip on Hamilton's grave. He will, however, accept them in the poor box.",
              );
            },
            next: "thanks",
          },
        ],
      },
      thanks: {
        text: 'Take the Rector\'s pistol. "Weehawken," he called it — an old joke about a duel. Use it on things that deserve it. And come back whenever you need a pew.',
        responses: [{ text: "Goodbye, Reverend." }],
      },
    },
  });

  // --- dialogue: sealing the breach -------------------------------------
  PF.dialogue("pf_dlg_breach", {
    start: "root",
    nodes: {
      root: {
        speaker: "The Breach",
        text: () =>
          "A ragged hole in the crypt's south wall, where colonial bricks have been clawed out from the far side. Cold air breathes out of the dark, smelling of river mud and something worse." +
          (PF.getNpc("pf_tr_sexton") && !PF.getNpc("pf_tr_sexton").dead
            ? " Deep in the tunnel, something big is breathing."
            : ""),
        responses: [
          {
            text: "[Mechanics 40] Brace the hole with pew timbers and rubble.",
            check: { skill: "mechanics", value: 40 },
            action: () => sealBreach("brace"),
            failNext: "fail_repair",
          },
          {
            text: "[Explosives 35] Wedge a frag grenade in the roof of the tunnel and collapse it.",
            check: { skill: "explosives", value: 35 },
            cond: () => PF.inv.count("frag_grenade") > 0,
            action: () => sealBreach("blast"),
            failNext: "fail_blast",
          },
          {
            text: "Pack the hole with rubble, one stone at a time. (Takes an hour)",
            action: () => sealBreach("rubble"),
          },
          { text: "Leave it for now." },
        ],
      },
      fail_repair: {
        speaker: "The Breach",
        text: "The timbers slip and crash. You're going to need a better plan — or more patience.",
        responses: [
          {
            text: "Pack it with rubble instead. (Takes an hour)",
            action: () => sealBreach("rubble"),
          },
          { text: "Leave it." },
        ],
      },
      fail_blast: {
        speaker: "The Breach",
        text: "You look at the grenade. You look at the ceiling. You look at the forty feet of church on top of the ceiling. Maybe not.",
        responses: [
          {
            text: "Pack it with rubble instead. (Takes an hour)",
            action: () => sealBreach("rubble"),
          },
          { text: "Leave it." },
        ],
      },
    },
  });

  // --- dialogue: Doctor Hester Obi ----------------------------------------
  PF.dialogue("pf_dlg_obi", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          "Doctor Obi. Infirmary's open, supplies are not infinite. " +
          (G.player && G.player.hp < G.player.maxHp * 0.7
            ? "You're leaking. Sit."
            : "You look vertical, which is my favourite kind of patient."),
        responses: [
          {
            text: "[30 scrip] Patch me up.",
            cond: () => PF.inv.scrip() >= 30,
            action: () => {
              PF.inv.addScrip(-30);
              heal(false);
            },
            next: "healed",
            repeatable: true,
          },
          {
            text: "[75 scrip] Flush the radiation out of me.",
            cond: () => PF.inv.scrip() >= 75,
            action: () => {
              PF.inv.addScrip(-75);
              heal(true);
            },
            next: "flushed",
            repeatable: true,
          },
          { text: "Let me see what you're selling.", barter: true },
          {
            text: "How do you keep a clinic running out here?",
            next: "clinic",
          },
          { text: "Take care, Doc." },
        ],
      },
      healed: {
        text: "There. Stitches, a Rally Tonic and a stern look. The stern look is free.",
        responses: [{ text: "Thanks, Doc." }],
      },
      flushed: {
        text: "Prussian Blue, forty minutes on a cot, and I'll ask you not to glow in my infirmary again. The Reverend thinks it's a sign.",
        responses: [{ text: "Thanks, Doc." }],
      },
      clinic: {
        text: "Pills and tonic from the Seaport traders before the Shellbacks moved in, Prussian Blue from whatever the Reverend can beg. I was a veterinary nurse before all this. Turns out people are just large, whiny dogs.",
        responses: [{ text: "Fair.", next: "root" }],
      },
    },
  });
