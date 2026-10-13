// play-inline-350 05 — end
// Lines 770-1008 of readable/play-inline-350.pretty.js (statement-aligned).
  function startRelic() {
    K.q.start("pc_relic");
    if (K.has("pc_sp_reliquary")) K.q.set("pc_relic", "return");
  }
  function finishRelic(mode) {
    if (PC.flag("sp_relic_done")) return;
    PC.setFlag("sp_relic_done", mode);
    if (mode === "given" || mode === "paid") {
      K.take("pc_sp_reliquary", 1);
      K.give("pc_sp_holywater", mode === "paid" ? 2 : 4);
      K.scrip(mode === "paid" ? 200 : 60);
      K.standing(mode === "paid" ? 5 : 30, "Returned the Bell Reliquary");
      K.sfx("bell", null, { volume: 0.8 });
    } else K.standing(-15, "Kept the Bell Reliquary");
    if (!K.q.active("pc_relic")) K.q.start("pc_relic");
    K.q.complete("pc_relic");
  }
  function dataStPat() {
    K.defineItem({
      id: "pc_sp_sexton_key",
      type: "key",
      name: "Sexton's Key",
      weight: 0,
      value: 0,
      desc: "A black iron key on a length of knotted string, greasy with handling. Opens the grille of the Bishops' Crypt beneath Old St. Patrick's.",
    });
    K.defineItem({
      id: "pc_sp_holywater",
      type: "aid",
      name: "Holy Water",
      weight: 0.5,
      value: 25,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { hp: 30, rads: -25 },
      desc: "Water from the old cathedral's cistern, boiled, filtered through charcoal and blessed by Sister Agnes. Tastes like pennies. Heals 30 HP and flushes 25 rads.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pc_relic",
        name: "The Bell of St. Patrick",
        giver: "Sister Agnes",
        location: "Old St. Patrick's Cathedral",
        desc: "Sister Agnes, who has kept the churchyard of Old St. Patrick's since before the bombs, wants the cathedral's oldest treasure brought up from the Bishops' Crypt: a silver reliquary holding a fragment of the Bell of St. Patrick. The catacombs are full of Maniacs — her former parishioners — and the crypt was locked by the Sexton.",
        stages: [
          {
            id: "find",
            text: "Find the Bell Reliquary in the Bishops' Crypt, in the catacombs beneath Old St. Patrick's (the Sexton had the key).",
            markers: [marker("old_st_patricks", "crypt", "Bishops' Crypt")],
          },
          {
            id: "return",
            text: "Bring the Bell Reliquary to Sister Agnes in the churchyard.",
            markers: [{ npc: "pc_sp_agnes", label: "Sister Agnes" }],
          },
        ],
        rewards: { xp: 300 },
      });
    }
    G.events.on("itemAdded", (id) => {
      if (id === "pc_sp_reliquary" && K.q.active("pc_relic"))
        K.q.set("pc_relic", "return");
    });
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pc_dlg_agnes", {
      start: () =>
        PC.flag("sp_relic_done")
          ? "after"
          : K.has("pc_sp_reliquary")
            ? "relic"
            : PC.flag("sp_met_agnes")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Sister Agnes",
          onEnter: () => PC.setFlag("sp_met_agnes", true),
          text: "Peace be with you, child. Mind the graves — the Kiernans are touchy. I am Sister Agnes, of the Sisters of Charity, formerly of this parish and currently of this churchyard. Yes, I am seventy-one, and yes, I sleep out here. Most of my congregation sleeps below, and they are rather less conversational than I am. And no, I am not one of those sun people uptown. They took a cathedral on Fifth Avenue and lit it for their bomb. I kept a churchyard and lit it for the dead.",
          responses: [
            { text: "Your congregation?", next: "flock" },
            { text: "Do you have anything to trade?", barter: true, end: true },
            { text: "I should go.", end: true },
          ],
        },
        flock: {
          speaker: "Sister Agnes",
          text: "The people who sheltered in the catacombs when the bombs fell. The sick came down, and the sickness stayed. They walk the nave now, and the tunnels. I still say the Office for them at dusk. They don't mind. Much.",
          responses: [
            { text: "Is there anything I can do?", next: "ask" },
            { text: "That's grim.", end: true },
          ],
        },
        ask: {
          speaker: "Sister Agnes",
          text: "There is. Below the sanctuary, in the Bishops' Crypt, Father Delaney locked away our oldest treasure — a silver reliquary with a piece of the Bell of St. Patrick himself, carried here from Armagh in 1831. Our bell-cote has stood empty since before I took my vows. I would like to hear it ring again before I go. The Sexton had the only key to the crypt. I fear the Sexton is... still down there.",
          responses: [
            {
              text: "I'll bring back your relic.",
              next: "yes",
              action: () => startRelic(),
            },
            {
              text: "[Persuasion 40] What's in it for me?",
              check: { skill: "persuasion", value: 40 },
              next: "pay",
              failNext: "pay_fail",
            },
            { text: "Not today, Sister.", end: true },
          ],
        },
        pay: {
          speaker: "Sister Agnes",
          onEnter: () => PC.setFlag("sp_agnes_paid", true),
          text: "(A dry laugh.) Honest, at least. The poor box is not empty, and I brew holy water that will take the radiation out of a Ripjaw. You'll be paid.",
          responses: [
            {
              text: "Then I'll do it.",
              next: "yes",
              action: () => startRelic(),
            },
          ],
        },
        pay_fail: {
          speaker: "Sister Agnes",
          text: "The satisfaction of a good deed, and my prayers. They're worth more than you think. I also have holy water.",
          responses: [
            {
              text: "Fine. I'll do it.",
              next: "yes",
              action: () => startRelic(),
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        yes: {
          speaker: "Sister Agnes",
          text: "God bless you. The way down is through the sacristy, behind the high altar, on the right. The catacombs run under the whole block — the crypt is off the long gallery. Be gentle with my flock if you can. Be quick if you can't.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        again: {
          speaker: "Sister Agnes",
          text: "Back so soon? The sacristy stair, child — behind the altar, on the right. And do take some holy water before you go down.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "About the reliquary...",
              next: "ask",
              cond: () => !K.q.started("pc_relic"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        relic: {
          speaker: "Sister Agnes",
          text: "(She takes the silver casket in both hands, very carefully, the way you would hold a sleeping bird. She tilts it. Inside, something rings — tiny, clear.) ...Oh. Oh, listen to that.",
          responses: [
            {
              text: "It belongs here. Take it.",
              next: "thanks",
              action: () =>
                finishRelic(PC.flag("sp_agnes_paid") ? "paid" : "given"),
            },
            { text: "Actually, I'm keeping it. Silver sells.", next: "keep" },
          ],
        },
        thanks: {
          speaker: "Sister Agnes",
          text: "Tonight I'll hang it in the bell-cote and ring it for the Sexton, and Father Delaney, and all of them down there. Take this — holy water, and what the poor box can spare. And come to Vespers sometime. The singing is terrible, but it's sincere.",
          responses: [{ text: "Goodbye, Sister.", end: true }],
        },
        keep: {
          speaker: "Sister Agnes",
          text: "(Her hands fall.) ...Then I will pray for you, too. Go on. The Lord is patient. I am less so, but I am old, and slow.",
          responses: [
            { text: "Goodbye.", end: true, action: () => finishRelic("kept") },
          ],
        },
        after: {
          speaker: "Sister Agnes",
          text: () =>
            PC.flag("sp_relic_done") === "kept"
              ? "Peace be with you, child. Even you."
              : "Did you hear it last night? Half the Maniacs in the nave stopped howling, just for a moment. Just to listen.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
  }
  function spawnStPatExt(ctx) {
    const a = ctx.anchors.agnes;
    if (!a) return;
    const stock = K.stock(
      [
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["iodine_tabs", 2],
        ["pc_sp_holywater", 4],
        ["purified_water", 3],
      ],
      "merchant_doctor",
      4,
    );
    // a plain dark habit and veil (Sisters of Charity), never Glowkeeper robes (outline sideQuestChanges: pc_relic)
    PC.spawnActor(ctx, {
      id: "pc_sp_agnes",
      type:
        G.chars && G.chars.info && G.chars.info("sister_agnes")
          ? "sister_agnes"
          : "human",
      gender: "f",
      outfit: "settler",
      hat: "hood",
      hatColor: 0x26252b,
      name: "Sister Agnes",
      faction: "settlers",
      level: 6,
      essential: true,
      hostile: false,
      pos: v(a),
      yaw: -Math.PI / 2,
      ai: "merchant",
      home: "here",
      homeR: 3,
      dialogue: "pc_dlg_agnes",
      voice: "settler",
      merchant: { scrip: 250, stock, restock: 3 },
      barks: [
        "Peace be with you, child.",
        "Mind the graves.",
        "The Lord is my shepherd. The Maniacs are my flock. It's a complicated metaphor.",
        "Vespers at dusk. Singing optional. Screaming discouraged.",
      ],
    });
  }
  PC.part("old_st_patricks", { data: dataStPat, spawn: spawnStPatExt });
