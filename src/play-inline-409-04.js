// play-inline-409 04 — next
// Lines 1241-1732 of readable/play-inline-409.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "pf3_fh_archive_key",
      type: "key",
      name: "Sub-Treasury Vault Key",
      weight: 0,
      value: 0,
      tags: ["key", "quest"],
      desc: "A heavy brass key on a length of red ribbon, stamped U.S. SUB-TREASURY · NEW YORK · VAULT B. Speaker Voss wore it like a chain of office.",
    });
    K.defineItem({
      id: "pf3_cog_core",
      type: "misc",
      name: "COG Archive Core",
      weight: 3,
      value: 450,
      tags: ["quest", "valuable", "unique"],
      desc: "A shock-mounted data core the size of a lunchbox, stencilled CONTINUITY OF GOVERNMENT — ARCHIVE 7 — TOP SECRET. Inside: every secret the government kept on this coast from Truman to the Bombing, and whatever it thought was worth saving when it stopped existing. The Continuity would very much like it back.",
    });
    K.defineItem({
      id: "pf3_speaker_gavel",
      type: "misc",
      name: "Speaker's Gavel",
      weight: 1,
      value: 120,
      tags: ["valuable", "unique"],
      desc: "Voss's gavel: a sledgehammer head wired to a chair leg, hand-lettered ORDER. It has called a great many sessions to order.",
    });
    K.defineItem({
      id: "pf3_fh_bible_page",
      type: "misc",
      name: "Inaugural Bible Plate",
      weight: 0.5,
      value: 60,
      tags: ["valuable"],
      desc: 'An engraved brass museum plate: "The Bible upon which George Washington took the oath of office." The Bible itself is long gone. The raiders kept the plate because it was shiny.',
    });
    // The core's last priority traffic (mq22's proof: Deputy Director Marsh moved the rolls and the enrolled to Liberty the
    // night before the Bombing, and told no one) is read on the node teletype; the main story files its own carbon (NOTES).
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pf3_cog",
        name: "Continuity of Government",
        giver: "Lancer Halloran",
        location: "Federal Hall",
        desc: "An Iron Covenant Lancer is pinned down under Federal Hall by the raider gang that calls itself the Congress. He wants the old government's archive core out of the Sub-Treasury strongroom before the Continuity remembers they left it there. What the core remembers is another matter.",
        stages: [
          {
            id: "key",
            text: "Get past Speaker Voss into the Sub-Treasury archive strongroom (Voss wears the key; Archivist Ames worked out the combination).",
            markers: [
              () => {
                const a = PV.anchor("federal_hall", "vault_door");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Archive Vault",
                      interior: "federal_hall",
                    }
                  : null;
              },
            ],
          },
          {
            id: "core",
            text: "Recover the COG Archive Core and read its last priority traffic.",
            markers: [
              () => {
                const a = PV.anchor("federal_hall", "core");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Archive Core",
                      interior: "federal_hall",
                    }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Decide who gets the core: Lancer Halloran, or (with his blessing) Rocky Delgado's microphone.",
            markers: [{ npc: "pf3_halloran", label: "Halloran" }],
          },
          {
            id: "read",
            sideObjective: true,
            text: "(Optional) Read the archive teletype's files on the node's last day.",
            doneIf: () => !!PV.flag("fh_memo_read"),
            showIf: () => !!PV.flag("fh_vault_open"),
          },
        ],
        rewards: { xp: 300 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    /** contract (src/quests/NOTES.md): the quest may be started at any time; put it where the world is. */
    const wantStage = () =>
      K.has("pf3_cog_core") || PV.flag("fh_core_taken")
        ? "return"
        : PV.flag("fh_vault_open")
          ? "core"
          : "key";
    const sync = () => {
      if (q.active("pf3_cog") && q.stage("pf3_cog") !== wantStage())
        q.set("pf3_cog", wantStage());
    };
    PV.cogSync = sync;
    G.events.on("questStarted", (v) => {
      if (v && v.id === "pf3_cog") setTimeout(sync, 0);
    });
    G.events.on("loaded", () => setTimeout(sync, 0));
    const startCog = () => {
      q.start("pf3_cog");
      sync();
    };
    // Every outline branch sets the main-story flag ms_core: 'given' (Halloran keeps the core for the Covenant) or
    // 'broadcast' (the memo goes out on Rocky Delgado's band over Halloran's field set). 'kept' = stolen (quest fails,
    // as before; the main story then lets the hero take the core to Rocky or Hale).
    const settle = (mode) => {
      PV.setFlag("fh_core_to", mode);
      if (mode === "given" || mode === "broadcast") K.setQFlag("ms_core", mode);
      if (mode === "broadcast") K.setQFlag("core_broadcast", true);
      if (mode === "given") K.setQFlag("core_given", true);
      if (!q.active("pf3_cog")) q.start("pf3_cog");
      if (mode === "kept") q.fail("pf3_cog");
      else q.complete("pf3_cog");
    };
    const onAir = () => {
      K.standing(30, "Broadcast the 4 March memo");
      K.safe("cog radio", () => {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            'Rocky here. Somebody patched into my band on a Covenant field set this afternoon and read me a piece of paper out of a vault on Wall Street, and I am going to read it to you again, slowly. Saturday, the fourth of March, nineteen sixty-seven. "Move the rolls and enrolled staff to Liberty tonight. No public notice. Protect the source." Signed: M. The night before, folks. They knew, and they saved their list.',
          );
      });
    };
    const reward = (extra) => () => {
      if (!K.has("pf3_cog_core")) return;
      K.take("pf3_cog_core", 1);
      K.give(
        K.itemExists("gyrojet_carbine") ? "gyrojet_carbine" : "hunting_rifle",
        1,
      );
      K.give(K.itemExists("ammo_gyrojet") ? "ammo_gyrojet" : "ammo_308", 40);
      K.give("rally_tonic", 3);
      K.scrip(100 + (extra || 0));
      K.standing(30, "Returned the COG archive to the Iron Covenant");
      PV.setFlag("fh_cog_covenant", true);
      settle("given");
    };
    G.dialogue.register("pf3_dlg_halloran", {
      start: () => {
        if (PV.flag("fh_core_to") || q.done("pf3_cog")) return "after";
        if (K.has("pf3_cog_core")) return "core";
        if (q.active("pf3_cog")) return "again";
        return PV.flag("fh_met_halloran") ? "again2" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Lancer Halloran",
          onEnter: () => PV.setFlag("fh_met_halloran", true),
          text: "[A man in a scorched Iron Covenant Exo-rig, slit visor pushed up, gyrojet carbine braced on the sandbags. His leg is splinted with a table leg.] Hold it. You're not wearing a tire on your head, so you're not Congress. Lancer Halloran, Iron Covenant, out of Rockefeller Center. What's left of my squad is in the hallway. In pieces.",
          responses: [
            { text: "What happened here?", next: "what" },
            { text: "You need help?", next: "help" },
            { text: "I'll leave you to it.", end: true },
          ],
        },
        what: {
          speaker: "Lancer Halloran",
          text: "Archivist Ames decoded an old-world government memo: Federal Hall's Sub-Treasury strongroom was a Continuity of Government node. An archive core, every program the old government ran on this coast, right up to the morning of the Bombing. Lancer-Commander Stroud wants it before the Continuity remembers they left it here. Those people still think it's 1967; they'd use it like it is. We came in quiet. The Congress was in session.",
          responses: [
            { text: "The Congress?", next: "congress" },
            { text: "What do you need?", next: "help" },
          ],
        },
        congress: {
          speaker: "Lancer Halloran",
          text: "Raiders who found the building and read the plaques. Their boss calls himself Speaker Voss: holds \"sessions\" in the rotunda, votes on who gets eaten, taxes Wall Street in bullets, whenever Bear Market Betty's crew at the Exchange hasn't taxed it first. Those two hate each other worse than they hate us. Voss has the strongroom key round his neck; they took it off the last Sub-Treasury guard. What's left of him.",
          responses: [{ text: "What do you need?", next: "help" }],
        },
        help: {
          speaker: "Lancer Halloran",
          text: "The archive strongroom is at the west end of this hall. Big round door, old-world Mosler. Voss has the key, or you can talk him out of it if you've got the tongue for it. Or: Ames worked the combination out of the memo before the Congress got her. Her notebook should still be on her, out in the hall where she fell. Get the core out and bring it to me. The Covenant pays its debts: a gyrojet carbine and the rockets to feed it.",
          responses: [
            { text: "I'll get your core.", next: "yes", action: startCog },
            {
              text: "[Persuasion 50] A carbine for a trip past a whole raider gang? Make it worth my while.",
              check: { skill: "persuasion", value: 50 },
              next: "more",
              failNext: "more_fail",
            },
            { text: "Not my war.", end: true },
          ],
        },
        more: {
          speaker: "Lancer Halloran",
          onEnter: () => PV.setFlag("fh_bonus", 150),
          text: "[He almost laughs, which hurts him.] Fine, mercenary. A hundred and fifty scrip on top, out of the squad fund. They won't be needing it.",
          responses: [{ text: "Deal.", next: "yes", action: startCog }],
        },
        more_fail: {
          speaker: "Lancer Halloran",
          text: "Worth your while is not dying in a raider's stewpot. That's the offer.",
          responses: [
            { text: "Fine. I'll get it.", next: "yes", action: startCog },
            { text: "Not my war.", end: true },
          ],
        },
        yes: {
          speaker: "Lancer Halloran",
          text: "Iron holds. And if you find Acolyte Quintero's tags out there, bring them back. His mother sells candles at the Neon.",
          responses: [{ text: "I will.", end: true }],
        },
        again: {
          speaker: "Lancer Halloran",
          text: () =>
            PV.flag("fh_vault_open")
              ? "Door's open? Then get in there and get the core. I'll hold the hallway."
              : "Voss still breathing? The key's on him. Or find Ames's notebook: the combination's in it, if the Congress didn't eat the page.",
          responses: [{ text: "Working on it.", end: true }],
        },
        again2: {
          speaker: "Lancer Halloran",
          text: "Changed your mind about the archive?",
          responses: [
            { text: "Tell me again.", next: "help" },
            { text: "No.", end: true },
          ],
        },
        core: {
          speaker: "Lancer Halloran",
          text: "[He looks at the core in your hands like a man looking at a newborn.] Archive Seven. The Archivists are going to lose their minds. You did good, survivor. Better than good: you did it alive. Hand it over.",
          responses: [
            {
              text: "[Give him the core] It's yours. Iron holds.",
              next: "paid",
              action: () => reward(PV.flag("fh_bonus") || 0)(),
            },
            {
              text: "Read the last thing on it first. The teleprinter strip.",
              next: "memo",
            },
            {
              text: "[Keep the core] Actually, I think I'll hang on to this.",
              next: "keep",
            },
          ],
        },
        memo: {
          speaker: "Lancer Halloran",
          onEnter: () => PV.setFlag("fh_halloran_read", true),
          text: '[He reads the strip twice. His mouth goes thin.] "Move the rolls and enrolled staff to Liberty tonight. No public notice. Protect the source. M." Fourth of March. They knew. The night before, they knew, and they saved their list and let the city sleep. [He hands it back.] The Archivists will file this under "history". It shouldn\'t be history. It should be on the radio.',
          responses: [
            {
              text: "Then that's where it goes. Can that field set of yours reach Rocky Delgado's band?",
              next: "broadcast",
            },
            {
              text: "It's still yours. Take the core.",
              next: "paid",
              action: () => reward(PV.flag("fh_bonus") || 0)(),
            },
          ],
        },
        broadcast: {
          speaker: "Lancer Halloran",
          text: "[A long breath through his teeth. Then he unclips the field set from his rig and starts winding the crank.] Stroud will have my rig for this. Let him. [Static, a dial, a burst of swing music, a man saying \"Rocky, go.\"] You're on. Read it slowly.\n\n[You read the strip into the handset, twice. On the second reading the music behind Rocky stops.]\n\n[Halloran takes the handset back.] The words are out. The Archivists can still have the hardware, if you'll let them.",
          responses: [
            {
              text: "[Give him the core] Take it. Iron holds.",
              next: "aired",
              action: () => {
                K.take("pf3_cog_core", 1);
                K.give("ammo_gyrojet", 20);
                K.scrip(60);
                PV.setFlag("fh_cog_covenant", true);
                onAir();
                settle("broadcast");
              },
            },
            {
              text: "I'll hang on to it. Somebody might call it a lie.",
              next: "aired",
              action: () => {
                K.give("ammo_gyrojet", 12);
                onAir();
                settle("broadcast");
              },
            },
          ],
        },
        aired: {
          speaker: "Lancer Halloran",
          text: "I'll tell the Lancer-Commander a stranger walked through the Congress and gave the city back its own paperwork. He won't believe it either. Iron holds.",
          responses: [{ text: "Iron holds.", end: true }],
        },
        keep: {
          speaker: "Lancer Halloran",
          text: "[The carbine comes up. Then, slowly, goes down.] I can't chase you on this leg, and I won't shoot a civilian in the back. But the Covenant has a long memory. Think hard about who buys that thing from you.",
          responses: [
            {
              text: "Fine. Take it.",
              next: "paid",
              action: () => reward(PV.flag("fh_bonus") || 0)(),
            },
            {
              text: "The city should hear what's on it. Read it first.",
              next: "memo",
            },
            {
              text: "Nothing personal.",
              end: true,
              action: () => {
                PV.setFlag("fh_cog_kept", true);
                K.standing(-25, "Stole the COG archive");
                settle("kept");
              },
            },
          ],
        },
        paid: {
          speaker: "Lancer Halloran",
          text: "Your carbine, your packs, and the Covenant's thanks. When my relief gets here, I'll tell the Lancer-Commander a stranger walked through the Congress to do our job. He won't believe it either.",
          responses: [{ text: "Iron holds.", end: true }],
        },
        after: {
          speaker: "Lancer Halloran",
          text: () =>
            PV.flag("fh_core_to") === "broadcast"
              ? "Heard it again last night on Rocky's band. \"Protect the source.\" I've been saying it in my head all week. Go on, the Congress isn't going to un-elect itself."
              : PV.flag("fh_core_to") === "kept"
                ? "You. The thief. Keep walking."
                : PV.flag("fh_cog_covenant")
                  ? "Relief's coming at dawn. I'll be fine. Go on, the Congress isn't going to un-elect itself."
                  : "You. The thief. Keep walking.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pf3_dlg_fh_sgt", {
      start: () =>
        PV.flag("fh_congress_hostile")
          ? "war"
          : PV.flag("fh_tax_paid")
            ? "paid"
            : "hello",
      nodes: {
        hello: {
          speaker: "Sergeant-at-Arms",
          text: "[A slab of a raider in a riot helmet with a tricorn wired to it. He levels a shotgun at your belt buckle.] HALT. You are standing in the chamber of the Congress of Wall Street. Visitors pay the entry tax. Ten scrip. Weapons stay holstered. The Speaker is on the throne, if you got business with the Congress.",
          responses: [
            {
              text: "[Pay 10 scrip] Here.",
              cond: () => K.scripCount() >= 10,
              next: "paid_now",
              action: () => {
                K.scrip(-10);
                PV.setFlag("fh_tax_paid", true);
              },
            },
            {
              text: "[Persuasion 40] I'm a visiting delegate. Delegates are exempt.",
              check: { skill: "persuasion", value: 40 },
              next: "exempt",
              failNext: "noexempt",
            },
            { text: "What is this, a toll booth?", next: "what" },
            { text: "I don't pay taxes.", next: "refuse" },
          ],
        },
        what: {
          speaker: "Sergeant-at-Arms",
          text: "This is DEMOCRACY, tourist. We found the building, we read the plaques. Congress makes the laws, Congress collects the taxes, Congress eats whoever votes nay. Ten scrip.",
          responses: [
            {
              text: "[Pay 10 scrip] Fine.",
              cond: () => K.scripCount() >= 10,
              next: "paid_now",
              action: () => {
                K.scrip(-10);
                PV.setFlag("fh_tax_paid", true);
              },
            },
            { text: "Not a chance.", next: "refuse" },
          ],
        },
        exempt: {
          speaker: "Sergeant-at-Arms",
          onEnter: () => {
            PV.setFlag("fh_tax_paid", true);
            K.xp(15, "Talked past the Sergeant-at-Arms");
          },
          text: "[He squints. Checks a clipboard he clearly cannot read.] ...Delegate. Right. Go on through. Don't touch the Speaker's hat.",
          responses: [{ text: "Wouldn't dream of it.", end: true }],
        },
        noexempt: {
          speaker: "Sergeant-at-Arms",
          text: "Nice try. Everybody's a delegate till they're lunch. Ten scrip.",
          responses: [
            {
              text: "[Pay 10 scrip] Fine.",
              cond: () => K.scripCount() >= 10,
              next: "paid_now",
              action: () => {
                K.scrip(-10);
                PV.setFlag("fh_tax_paid", true);
              },
            },
            { text: "No.", next: "refuse" },
          ],
        },
        refuse: {
          speaker: "Sergeant-at-Arms",
          text: "[He considers this.] Then you're a tax dodger, and tax dodgers get tabled. I'm gonna let the Speaker decide. Go on in. Slow.",
          responses: [{ text: "[Go in]", end: true }],
        },
        paid_now: {
          speaker: "Sergeant-at-Arms",
          text: "Pleasure doing business with the Treasury. Speaker's on the throne, north end. Bow a little. He likes that.",
          responses: [{ text: "Sure.", end: true }],
        },
        paid: {
          speaker: "Sergeant-at-Arms",
          text: "You paid. You're fine. For now.",
          responses: [{ text: "Right.", end: true }],
        },
        war: {
          speaker: "Sergeant-at-Arms",
          text: "The Congress has voted!",
          onEnter: () => PV.vossHostile && PV.vossHostile(),
          responses: [{ text: "[Fight]", end: true }],
        },
      },
    });
    G.dialogue.register("pf3_dlg_voss", {
      start: () => "hello",
      nodes: {
        hello: {
          speaker: "Speaker Voss",
          text: "ORDER! The chair recognises the... whatever you are. State your business before the Congress, and be brief — we're voting on lunch.",
          responses: [
            { text: "I want the Sub-Treasury key.", next: "key" },
            {
              text: "[Persuasion 70] Point of order: the Speaker must yield the floor to a visiting delegate.",
              check: { skill: "persuasion", value: 70 },
              next: "yield",
              failNext: "yield_fail",
            },
            { text: "I move we adjourn. Permanently.", next: "fight" },
          ],
        },
        key: {
          speaker: "Speaker Voss",
          text: "The key to the Treasury? That's a matter for the Appropriations Committee. [He pats the shotgun.] I AM the Appropriations Committee.",
          responses: [{ text: "Then I'll appropriate it.", next: "fight" }],
        },
        yield: {
          speaker: "Speaker Voss",
          text: "[He blinks. Checks a mildewed copy of Robert's Rules of Order duct-taped to his armrest. Checks it again.] ...The chair... yields. Motion carries. [He tosses you the key like it burns.] Session's over, everybody go loot something.",
          onEnter: () => {
            K.give("pf3_fh_archive_key", 1);
            PV.setFlag("fh_voss_yielded", true);
            K.xp(100, "Out-parliamented Speaker Voss");
            if (K.q.active("pf3_cog")) K.q.set("pf3_cog", "key");
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        yield_fail: {
          speaker: "Speaker Voss",
          text: "Point of order DENIED. The Congress votes you... [He looks around. Every hand goes up.] ...lunch.",
          responses: [{ text: "So be it.", next: "fight" }],
        },
        fight: {
          speaker: "Speaker Voss",
          text: "All in favour of killing the delegate? The ayes have it!",
          onEnter: () => PV.vossHostile && PV.vossHostile(),
          responses: [{ text: "[Fight]", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
