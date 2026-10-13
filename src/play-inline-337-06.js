// play-inline-337 06 — next
// Lines 3207-3672 of readable/play-inline-337.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "pev_tam_ledger",
      type: "misc",
      name: "The Black Book",
      weight: 1,
      value: 0,
      quest: true,
      desc: 'A fat leather ledger, gilt-edged, "A.C." on the spine. Every favor, bribe, patronage job and dead voter in the Fourth Ward since 1951, in the Boss\'s own tidy hand. Dynamite, bound in calfskin.',
    });
    K.keyFrom(
      "pev_tam_vault_key",
      "spare key in the secretary's drawer (appointments teletype)",
    );
    K.defineItem({
      id: "pev_tam_vault_key",
      type: "key",
      name: "Wigwam Key",
      weight: 0,
      value: 0,
      desc: 'A heavy brass key stamped "S.O.T. — WIGWAM." It opens the strongroom and fits the cells in the cellar. Everything in Tammany Hall opens with the same key, if you know who to ask.',
    });
    K.defineItem({
      id: "pev_tax_envelope",
      type: "misc",
      name: "Ward Tax Envelope",
      weight: 0,
      value: 150,
      quest: true,
      desc: "A fat envelope with 150 scrip in it and \"FOURTH WARD — O'ROURKE'S\" in Deck's angry handwriting. It still smells of onions.",
    });
    K.defineItem({
      id: "pev_tiger_pin",
      type: "apparel",
      slot: "eyes",
      name: "Tammany Tiger Pin",
      weight: 0,
      value: 120,
      attrs: { presence: 1 },
      skills: { trade: 10 },
      tags: ["apparel", "unique"],
      mesh: "badge",
      desc: "A gold tiger lapel pin. Wear it and every merchant in the Fourth Ward knows who you work for. They'll give you a discount. They will not give you a smile.",
    });
    K.defineItem({
      id: "pev_croke_derby",
      type: "apparel",
      slot: "head",
      name: "Boss Croke's Derby",
      weight: 1,
      value: 150,
      attrs: { presence: 1 },
      skills: { persuasion: 10 },
      mesh: "hat_bowler",
      tags: ["apparel", "hat", "unique"],
      desc: "A black bowler hat, the brim worn shiny by forty years of tipping it to voters. It fits any head. It has fit many.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pev_honest_graft",
        name: "Honest Graft",
        giver: "Deck O'Rourke",
        location: "Tammany Hall",
        desc: "Boss Aloysius Croke — an old ward boss who still runs Tammany Hall on Union Square like it's 1870 — squeezes O'Rourke's Old Ale House for a weekly \"ward tax.\" Deck O'Rourke wants it stopped. The Boss would rather you worked for him.",
        stages: [
          {
            id: "talk",
            text: "Deal with Boss Croke at Tammany Hall.",
            markers: [
              () => {
                const a = EV.anchor("tammany", "boss");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Boss Croke",
                      interior: "tammany_hall",
                    }
                  : null;
              },
            ],
          },
          {
            id: "tg_ledger",
            text: "(Optional) Find the Boss's Black Book in the Tammany strongroom.",
            sideObjective: true,
            optional: true,
            showIf: () =>
              !!EV.flag("heard_ledger") && K.q.active("pev_honest_graft"),
            doneIf: () => K.has("pev_tam_ledger") || !!EV.flag("ledger_used"),
          },
          {
            id: "tg_harriet",
            text: "(Optional) Free Harriet Vance from the Tammany cellar.",
            sideObjective: true,
            optional: true,
            showIf: () =>
              !!EV.flag("heard_harriet") && K.q.active("pev_honest_graft"),
            doneIf: () => !!EV.flag("harriet_free"),
          },
          {
            id: "collect",
            text: "Collect the ward tax from Deck O'Rourke.",
            markers: [{ npc: "pev_deck", label: "Deck" }],
          },
          {
            id: "deliver",
            text: "Bring the ward tax to Boss Croke.",
            markers: [{ npc: "pev_croke", label: "Boss Croke" }],
          },
          {
            id: "return",
            text: "Tell Deck O'Rourke the ward tax is finished.",
            markers: [{ npc: "pev_deck", label: "Deck" }],
          },
        ],
        rewards: { xp: 350 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const toReturn = () => {
      if (q.active("pev_honest_graft")) q.set("pev_honest_graft", "return");
      else if (!q.done("pev_honest_graft")) {
        q.start("pev_honest_graft");
        q.set("pev_honest_graft", "return");
      }
    };
    const exempt = (why) => {
      EV.setFlag("mcs_exempt", why || true);
      K.xp(100, "The ward tax is lifted");
      toReturn();
    };
    const hostile = () => EV.tamAnger("heckler");
    const scrip = () => K.scripCount();
    G.dialogue.register("pev_dlg_croke", {
      start: () => {
        if (EV.flag("mcs_exempt")) return "after";
        if (
          q.active("pev_honest_graft") &&
          q.stage("pev_honest_graft") === "deliver" &&
          K.has("pev_tax_envelope")
        )
          return "deliver";
        return EV.flag("met_croke") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Boss Croke",
          onEnter: () => EV.setFlag("met_croke", true),
          text: "Well, well, well! A constituent! Sit, sit — mind the tiger, he bites. Aloysius Croke, Grand Sachem of the Society of Tammany, Alderman for the Fourth Ward since 1951. Re-elected nineteen times — eleven of them since I died a little. Unopposed. Which is the best kind of opposed. What can the Machine do for you?",
          responses: [
            {
              text: "I'm here about O'Rourke's.",
              next: "mcs",
              cond: () =>
                q.active("pev_honest_graft") &&
                ["talk", "tg_ledger", "tg_harriet"].indexOf(
                  q.stage("pev_honest_graft"),
                ) >= 0,
            },
            { text: "Who are you, really?", next: "who" },
            { text: "Your Braves shot at me on the way in.", next: "braves" },
            {
              text: "Got any work?",
              next: "job",
              cond: () =>
                !q.started("pev_honest_graft") ||
                q.stage("pev_honest_graft") === "talk",
            },
            { text: "I've come to shut your machine down.", next: "threat" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Boss Croke",
          text: "Back again! The Wigwam's doors are always open. For a price. The price is voting for me. You've already voted for me — I checked.",
          responses: [
            {
              text: "About O'Rourke's...",
              next: "mcs",
              cond: () =>
                q.active("pev_honest_graft") &&
                ["talk", "tg_ledger", "tg_harriet"].indexOf(
                  q.stage("pev_honest_graft"),
                ) >= 0,
            },
            {
              text: "I've read your Black Book.",
              next: "blackmail",
              cond: () => K.has("pev_tam_ledger"),
            },
            {
              text: "Got any work?",
              next: "job",
              cond: () =>
                !q.started("pev_honest_graft") ||
                q.stage("pev_honest_graft") === "talk",
            },
            { text: "I've come to shut your machine down.", next: "threat" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Boss Croke",
          text: "A public servant, kid. Before the bombs I was a ward boss — you want a job, a permit, a pothole filled, a cousin out of the Tombs, you come to Croke. After the bombs... well. People still want things. Somebody has to be the one they come to. [He smiles. Most of his lips are gone. It's still a politician's smile.]",
          responses: [
            { text: 'And the "ward tax"?', next: "tax" },
            { text: "Back to business.", next: "again" },
          ],
        },
        tax: {
          speaker: "Boss Croke",
          text: "Protection. Sanitation. Representation. Every business in the Fourth Ward pays a little into the widows' fund. I'm the widows' fund. It's honest graft, kid — as a wise man on this very block once said: \"I seen my opportunities and I took 'em.\"",
          responses: [{ text: "Back to business.", next: "again" }],
        },
        braves: {
          speaker: "Boss Croke",
          text: "Did they! Overzealous. The Braves are... enthusiastic about the democratic process. You got past them, which makes you either a voter or a problem. Let's find out which.",
          responses: [{ text: "Back to business.", next: "again" }],
        },
        mcs: {
          speaker: "Boss Croke",
          onEnter: () => EV.setFlag("heard_ledger", true),
          text: "Ah. The ale house. Deck sent you? Deck pays the ward tax like every business in the Fourth Ward — a few scrip, a keg of dark, and his very good mustard. He's been complaining for thirty years. It's a tradition. Like the wishbones.",
          responses: [
            {
              text: "[Persuasion 60] Your own voters drink at O'Rourke's. Squeeze it dry and you lose the Fourth Ward.",
              check: { skill: "persuasion", value: 60 },
              next: "exempt_speech",
              failNext: "mcs_fail",
            },
            {
              text: "[Trade 50] Let me buy O'Rourke's out. 200 scrip, and the tax is gone for good.",
              cond: () => scrip() >= 200,
              check: { skill: "trade", value: 50 },
              next: "exempt_bribe",
              failNext: "bribe_fail",
            },
            {
              text: "I've read your Black Book.",
              next: "blackmail",
              cond: () => K.has("pev_tam_ledger"),
            },
            { text: "What would it take?", next: "job" },
            { text: "Then we do this the hard way.", next: "fight" },
          ],
        },
        mcs_fail: {
          speaker: "Boss Croke",
          text: "Voters? Kid, the voters don't decide elections here. I decide elections here. The voters decide which bar to drink at afterward. Try again when you've got something I want.",
          responses: [
            { text: "What would it take?", next: "job" },
            { text: "Then we do this the hard way.", next: "fight" },
            { text: "I'll be back.", end: true },
          ],
        },
        exempt_speech: {
          speaker: "Boss Croke",
          text: "[He stares. He drums his fingers on the desk. Then he laughs, a long wet smoker's laugh.] You know, kid, you've got a future in politics. Fine. O'Rourke's is off the books. Tell Deck the Wigwam sends its regards — and that he can keep his damn mustard.",
          onEnter: () => exempt("speech"),
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        exempt_bribe: {
          speaker: "Boss Croke",
          text: "Two hundred scrip for a lifetime exemption? [He counts. Recounts.] Kid, that's the worst deal I've ever taken, and I once traded a Brooklyn ward for a sandwich. Done. O'Rourke's is clean.",
          onEnter: () => {
            K.scrip(-200);
            exempt("bribe");
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        bribe_fail: {
          speaker: "Boss Croke",
          text: "Two hundred? For a whole ale house, forever? Kid, I charge more than that to not look at a building. No.",
          responses: [
            { text: "What would it take?", next: "job" },
            { text: "I'll be back.", end: true },
          ],
        },
        blackmail: {
          speaker: "Boss Croke",
          text: "[The smile goes.] Where did you — that's — [He lowers his voice.] Every deal since '51 is in that book. The aldermen. The Braves. The Iron Covenant's quartermaster. You hand that to the wrong people and the whole Machine comes down. ...What do you want?",
          responses: [
            {
              text: "Leave O'Rourke's alone. Forever. I keep the book as insurance.",
              next: "bm_keep",
              action: () => EV.setFlag("ledger_used", true),
            },
            {
              text: "Leave O'Rourke's alone, and I'll sell you the book back. 300 scrip.",
              next: "bm_sell",
            },
            {
              text: "[Persuasion 75] Step down. Leave the Wigwam. Let the East Village have a real election.",
              check: { skill: "persuasion", value: 75 },
              next: "resign",
              failNext: "resign_fail",
            },
          ],
        },
        bm_keep: {
          speaker: "Boss Croke",
          text: "Insurance. [He sags into his chair.] You're a Tammany man after all, kid, you just don't know it yet. Fine. O'Rourke's is off the books. Now get out of my office before I start liking you.",
          onEnter: () => exempt("ledger"),
          responses: [{ text: "Be good or be gone, Boss.", end: true }],
        },
        bm_sell: {
          speaker: "Boss Croke",
          text: "Three hundred — and O'Rourke's. [He slides a stack of scrip across the desk and holds out his hand for the book, fingers trembling.] Pleasure. Truly. Don't come back.",
          onEnter: () => {
            K.take("pev_tam_ledger", 1);
            K.scrip(300);
            EV.setFlag("ledger_used", true);
            exempt("ledger_sold");
          },
          responses: [{ text: "Goodbye, Boss.", end: true }],
        },
        resign: {
          speaker: "Boss Croke",
          text: "[A long silence. Then he stands, straightens his tie, and takes his derby off the hook.] Nineteen terms. Thirty-eight years. Not a bad run. Tell Deck... tell him the dark was always better. I'll be in Florida. I hear it's still there. [He puts the derby on your head, pats it twice, and walks out.]",
          onEnter: () => {
            EV.setFlag("boss_resigned", true);
            EV.setFlag("ledger_used", true);
            K.give("pev_croke_derby", 1);
            K.standing(30, "Ended Tammany Hall");
            exempt("resigned");
            EV.crokeLeave();
          },
          responses: [{ text: "Goodbye, Boss.", end: true }],
        },
        resign_fail: {
          speaker: "Boss Croke",
          text: "Step down? Kid, I've outlived the Republic. I'll outlive you. Take O'Rourke's — take it, it's yours — but the Wigwam stays mine.",
          onEnter: () => {
            EV.setFlag("ledger_used", true);
            exempt("ledger");
          },
          responses: [{ text: "We'll see.", end: true }],
        },
        job: {
          speaker: "Boss Croke",
          text: "Every ward needs a captain. Deck owes me this week's tax — a hundred and fifty scrip. He doesn't like my Braves; maybe he'll like you. Collect it, bring it here, and you keep a slice. That's honest graft, kid. First rung on the ladder.",
          responses: [
            {
              text: "Consider it done.",
              next: "job_yes",
              action: () => {
                q.start("pev_honest_graft");
                q.set("pev_honest_graft", "collect");
              },
            },
            { text: "I don't shake down bartenders.", next: "job_no" },
          ],
        },
        job_yes: {
          speaker: "Boss Croke",
          text: "Attaboy. And kid — if Deck gives you any lip, remind him who fixed his liquor license in 1952. (It was me. It's always me.)",
          responses: [{ text: "Right.", end: true }],
        },
        job_no: {
          speaker: "Boss Croke",
          text: "Principles! How refreshing. Nobody's had those in this building since 1929. Well, the door's over there, principles and all.",
          responses: [
            {
              text: "About O'Rourke's...",
              next: "mcs",
              cond: () => q.active("pev_honest_graft"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        deliver: {
          speaker: "Boss Croke",
          text: "[He weighs the envelope, sniffs it.] Onions. That's Deck, alright. Hundred and fifty — you're a natural. Here's your cut, and a little something for the lapel. Welcome to the Machine, kid.",
          onEnter: () => {
            if (!K.has("pev_tax_envelope")) return;
            K.take("pev_tax_envelope", 1);
            K.scrip(200);
            K.give("pev_tiger_pin", 1);
            K.standing(-50, "Collected Tammany's ward tax");
            EV.setFlag("graft_evil", true);
            K.q.complete("pev_honest_graft");
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        threat: {
          speaker: "Boss Croke",
          text: "Shut it down? [He chuckles.] Kid, Tammany's been \"shut down\" by reformers, newspapers, the governor, the FBI and an atomic war. We're still here. You've got nothing on me.",
          responses: [
            {
              text: "I've got your Black Book.",
              next: "blackmail",
              cond: () => K.has("pev_tam_ledger"),
            },
            { text: "I've got a gun.", next: "fight" },
            { text: "Fair point. Goodbye.", end: true },
          ],
        },
        fight: {
          speaker: "Boss Croke",
          text: "BRAVES! We have a HECKLER!",
          onEnter: () => {
            EV.setFlag("croke_angry", true);
            setTimeout(hostile, 50);
          },
          responses: [{ text: "[Attack]", end: true }],
        },
        after: {
          speaker: "Boss Croke",
          text: "You again. You cost me a keg of dark a week and my good mood. I'll remember you on Election Day. Everybody votes on Election Day, kid. Even the ones who don't know it.",
          responses: [{ text: "Goodbye, Boss.", end: true }],
        },
      },
    });
    G.dialogue.register("pev_dlg_harriet", {
      start: () =>
        EV.flag("harriet_free")
          ? "free"
          : EV.flag("harriet_cell_open")
            ? "open"
            : "hello",
      nodes: {
        hello: {
          speaker: "Harriet Vance",
          onEnter: () => EV.setFlag("heard_harriet", true),
          text: 'You\'re not a Brave. — Harriet Vance. I ran against Croke for Alderman. First opponent in thirty-eight years. He counted the ballots, I got zero — including mine — and then he put me in here to "reconsider." I have not reconsidered.',
          responses: [
            { text: "I'll get you out.", next: "out" },
            { text: "Why run against him?", next: "why" },
            { text: "Good luck with that.", end: true },
          ],
        },
        why: {
          speaker: "Harriet Vance",
          text: "Because somebody has to. The Braves shake down every stall from Union Square to Houston. O'Rourke's pays in ale and mustard. The Beer Garden pays in hops. People are scared of him because nobody's ever voted against him and lived to brag about it. I'd like to brag about it.",
          responses: [{ text: "I'll get you out.", next: "out" }],
        },
        out: {
          speaker: "Harriet Vance",
          text: "The cell key's on the Boss's ring — or pick it, if you've got the hands. Get me out and I'll make my way to O'Rourke's. Deck will hide me. Then we'll see about an election.",
          responses: [{ text: "Hang on.", end: true }],
        },
        open: {
          speaker: "Harriet Vance",
          text: "The door's open. [She steps out, blinking.] You know how long I've been staring at that door? Thank you. I'm going to O'Rourke's. And then I'm going to win.",
          responses: [
            {
              text: "Go. I'll cover you.",
              next: "free",
              action: () => freeHarriet(),
            },
          ],
        },
        free: {
          speaker: "Harriet Vance",
          text: () =>
            EV.flag("boss_resigned") || EV.flag("boss_dead")
              ? "The Wigwam's empty. The Fourth Ward's having a real election for the first time in thirty-eight years. I'm going to lose it gracefully, or win it loudly."
              : "Vote Vance. Tell your friends. Tell your enemies. Tell the dead — they vote here, apparently.",
          responses: [{ text: "Good luck, Harriet.", end: true }],
        },
      },
    });
  }
