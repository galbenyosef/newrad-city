// play-inline-183 05 — responses
// Lines 876-1206 of readable/play-inline-183.pretty.js (statement-aligned).
  K.dialogueDef("pmid_dlg_ike", {
    start: () =>
      K.q.active("pmid_q_bellevue") && K.inv.count("q_pmid_bv_meds") > 0
        ? "meds_back"
        : "hi",
    nodes: {
      hi: {
        speaker: "Cutman Ike",
        text: "Cutman Ike. I stop the bleeding between rounds and after the funerals. You hurt? Sit. You're not hurt? Then don't waste my gauze.",
        responses: [
          R("Patch me up. (30 scrip)", "healed", {
            cond: () => K.inv.scrip() >= 30 && G.player.hp < G.player.maxHp,
            action: () => {
              K.inv.addScrip(-30);
              try {
                if (!G.isStub("rpg") && G.rpg.doctorHeal) G.rpg.doctorHeal();
                else G.player.heal(G.player.maxHp);
              } catch (e) {
                G.player.heal(G.player.maxHp);
              }
            },
          }),
          R("You need anything?", "job", {
            cond: () => !K.q.started("pmid_q_bellevue"),
          }),
          R("About Bellevue...", "progress", {
            cond: () => K.q.active("pmid_q_bellevue"),
          }),
          R("What have you got for sale?", null, { barter: true }),
          R("I'm fine.", null, { end: true }),
        ],
      },
      healed: {
        speaker: "Cutman Ike",
        text: "There. Good as new, if new was a little lumpy. Try blocking with your arms next time — that's what they're for.",
        responses: [R("Thanks, Doc.", null, { end: true })],
      },
      job: {
        speaker: "Cutman Ike",
        text: "Need anything? Kid, I'm sewing fighters up with fishing line and rotgut. Bellevue Hospital's pharmacy — over by the East River — ought to have real antibiotics sealed up in the psych wing. But the Brutes moved in. Big grey bastards, and they're... organised. Like somebody's running the place.",
        responses: [
          R("I'll get your medicine.", "accept", {
            action: () => {
              K.q.start("pmid_q_bellevue");
            },
          }),
          R(
            "[Medicine 40] Sulfa and morphine would last you years if you store them right.",
            "med",
            { check: { skill: "medicine", value: 40 }, failNext: "medfail" },
          ),
          R("What's in it for me?", "pay"),
          R("Not my problem.", null, { end: true }),
        ],
      },
      med: {
        speaker: "Cutman Ike",
        text: "A colleague! Yeah — cool and dry, away from the rads. You bring me that cache and I'll split it with you, fair and square. Doctor's honour.",
        responses: [
          R("Deal.", "accept", {
            action: () => {
              K.q.start("pmid_q_bellevue");
              K.q.setFlag("pmid_ike_split", true);
            },
          }),
        ],
      },
      medfail: {
        speaker: "Cutman Ike",
        text: "Uh-huh. And you learned that from a comic book. Just bring the medicine, doc.",
        responses: [
          R("Fine, I'll go.", "accept", {
            action: () => K.q.start("pmid_q_bellevue"),
          }),
          R("Forget it.", null, { end: true }),
        ],
      },
      pay: {
        speaker: "Cutman Ike",
        text: "Scrip, Rally Tonic, and free stitching for life. Which, given your line of work, is worth more than the scrip.",
        responses: [
          R("Deal.", "accept", { action: () => K.q.start("pmid_q_bellevue") }),
          R("No thanks.", null, { end: true }),
        ],
      },
      accept: {
        speaker: "Cutman Ike",
        text: "Bellevue. The old psychiatric building on First, iron fence, can't miss it. Pharmacy's off the nurses' station. And kid — if you find out who's running that place, I want to know.",
        responses: [R("I'll be back.", null, { end: true })],
      },
      progress: {
        speaker: "Cutman Ike",
        text: "Still waiting on that medicine. Pharmacy's off the nurses' station in the psych wing at Bellevue.",
        responses: [R("On my way.", null, { end: true })],
      },
      meds_back: {
        speaker: "Cutman Ike",
        text: "Is that — sulfa! Morphine! Sterile dressings, still sealed! Kid, you just saved more lives than you'll ever take in that ring.",
        responses: [
          R("Here. It's all yours.", "truth_q", {
            action: () => {
              K.inv.remove("q_pmid_bv_meds", 1);
              K.inv.addScrip(K.q.flag("pmid_ike_split") ? 150 : 120);
              K.standing(50, "Brought medicine to The Pit");
            },
          }),
          R("[Trade 50] Real medicine is worth more than that.", "haggle", {
            check: { skill: "trade", value: 50 },
            failNext: "haggle_fail",
          }),
        ],
      },
      haggle: {
        speaker: "Cutman Ike",
        text: "You're a bandit. You're a cryo suited bandit. ...Two hundred. And don't tell Mickey.",
        responses: [
          R("Pleasure.", "truth_q", {
            action: () => {
              K.inv.remove("q_pmid_bv_meds", 1);
              K.inv.addScrip(200);
            },
          }),
        ],
      },
      haggle_fail: {
        speaker: "Cutman Ike",
        text: "Nice try. A hundred and twenty and a lollipop. I'm out of lollipops.",
        responses: [
          R("Fine.", "truth_q", {
            action: () => {
              K.inv.remove("q_pmid_bv_meds", 1);
              K.inv.addScrip(120);
            },
          }),
        ],
      },
      truth_q: {
        speaker: "Cutman Ike",
        text: "So. Who's running that madhouse?",
        responses: [
          R(
            "Kessler-Haas was brewing K-agent under the hospital for Civil Defense. The Brutes are the patients.",
            "truth",
            { cond: () => K.q.flag("pmid_bv_truth") },
          ),
          R("A Brute who thinks he's the chief of medicine. Was.", "chief", {
            cond: () => K.q.flag("pmid_chief_dead"),
          }),
          R("I didn't stick around to find out.", "done"),
        ],
      },
      truth: {
        speaker: "Cutman Ike",
        text: () =>
          'God in heaven. They were treating the patients for it — "vitamins". ' +
          (K.q.flag("pmid_kagent_purged")
            ? "And you burned the tanks? Good. Good. Nobody gets to finish that experiment."
            : "And the tanks are still down there? Somebody's gonna want that stuff. Somebody in a black helmet, probably."),
        responses: [
          R("It's over now.", "done", {
            action: () => K.xp(100, "Learned the truth of Bellevue"),
          }),
        ],
      },
      chief: {
        speaker: "Cutman Ike",
        text: "A Brute... playing doctor. Twenty-two years of rounds. I'll drink to the poor bastard. He never had a chance to be anything else.",
        responses: [R("Me neither, some days.", "done")],
      },
      done: {
        speaker: "Cutman Ike",
        text: "Here — Rally Tonic, the good kind. And your stitches are free from now on. Doctor's orders.",
        responses: [
          R("Thanks, Ike.", null, {
            action: () => K.q.complete("pmid_q_bellevue"),
            end: true,
          }),
        ],
      },
    },
  });
  K.dialogueDef("pmid_dlg_hector", {
    start: () =>
      K.q.done("pmid_q_claim")
        ? "after"
        : K.inv.count("q_pmid_ml_cheque") > 0
          ? "cheque"
          : K.q.started("pmid_q_claim")
            ? "waiting"
            : "intro",
    nodes: {
      intro: {
        speaker: "Old Hector",
        text: 'Siddown, siddown. Hector Pfeiffer. Longshoreman, Pier 64, retired. You know what I did every month for twelve years? Paid Metropolitan Life. Eleven dollars and forty cents. "Whole life," they said. "Protect your family from the unexpected."',
        responses: [
          R("What happened?", "what"),
          R("I have to go.", null, { end: true }),
        ],
      },
      what: {
        speaker: "Old Hector",
        text: 'The unexpected happened! Bomb fell, the pier burned with me on it, family... well. I filed my claim. "Total incapacity." Walked it to the tower myself in \'68. Some robot at the desk stamped it DENIED. Act of God, he says. I says God\'s got nothing to do with whoever flew them planes. He says, "Please exit the building."',
        responses: [
          R(
            "The tower's still standing. Maybe the claim can be appealed.",
            "appeal",
          ),
          R("Insurance companies. Some things never change.", "never"),
          R("Sorry, Hector.", null, { end: true }),
        ],
      },
      never: {
        speaker: "Old Hector",
        text: "Twenty-two years and they're STILL the only business in New York that's open. Robots up there denying claims to nobody. I can see the clock from the roof here. Stuck at 9:47 like the rest of us.",
        responses: [
          R("I could try appealing your claim.", "appeal"),
          R("Take care, Hector.", null, { end: true }),
        ],
      },
      appeal: {
        speaker: "Old Hector",
        text: "You'd do that? The original policy's in their records vault — executive floor, they told me, like it's Fort Knox. And there's a big thinking-machine up in the clock that reviews appeals. \"Prudence,\" they called it. Get my claim through and... I don't know what I'd do with the money. Frame it, maybe. Show it to God.",
        responses: [
          R("I'll get your claim approved.", "yes", {
            action: () => {
              K.q.start("pmid_q_claim");
              if (K.inv.count("q_pmid_ml_policy") > 0)
                K.q.set("pmid_q_claim", "approve");
            },
          }),
          R("Maybe some other time.", null, { end: true }),
        ],
      },
      yes: {
        speaker: "Old Hector",
        text: "Madison Square, the white tower with the clock. Mind the robots — they don't take no for an answer. They only GIVE it.",
        responses: [R("Back soon.", null, { end: true })],
      },
      waiting: {
        speaker: "Old Hector",
        text: "Any word from the claims department? I've waited twenty-two years, I can wait a few more days. Probably. Heart's not what it was. Neither's the rest.",
        responses: [R("Working on it.", null, { end: true })],
      },
      cheque: {
        speaker: "Old Hector",
        text: "Is that... APPROVED? A certified cheque! Forty-eight thousand dollars! Kid, I — I don't know whether to laugh or fall apart. Well. More apart.",
        responses: [
          R("It's yours, Hector. You earned it.", "give", {
            standing: 50,
            action: () => {
              K.inv.remove("q_pmid_ml_cheque", 1);
              K.inv.addScrip(150);
              K.q.setFlag("pmid_claim_paid", true);
            },
          }),
          R(
            "[Persuasion 50] A cheque like that needs a finder's fee. Say... half your savings?",
            "speech",
            {
              check: { skill: "persuasion", value: 50 },
              failNext: "speech_fail",
            },
          ),
          R("I think I'll keep it. Consider it my commission.", "keep", {
            standing: -50,
            action: () => {
              K.q.setFlag("pmid_claim_kept", true);
            },
          }),
        ],
      },
      give: {
        speaker: "Old Hector",
        text: "Nobody's gonna cash it. I know that. But it says APPROVED, and it's got my name on it. Here — a hundred and fifty scrip. Every one I've got under the seat cushion. Don't argue with a policyholder.",
        responses: [
          R("Thank you, Hector.", null, {
            action: () => K.q.complete("pmid_q_claim"),
            end: true,
          }),
        ],
      },
      speech: {
        speaker: "Old Hector",
        text: "Ha! You'd have made a fine adjuster. Fine — two-fifty, and the cushion. I'll sit on the cheque instead.",
        responses: [
          R("Pleasure doing business.", null, {
            action: () => {
              K.inv.remove("q_pmid_ml_cheque", 1);
              K.inv.addScrip(250);
              K.q.setFlag("pmid_claim_paid", true);
              K.q.complete("pmid_q_claim");
            },
            end: true,
          }),
        ],
      },
      speech_fail: {
        speaker: "Old Hector",
        text: "Finder's fee? Kid, the robots asked for less. Here, a hundred and fifty, and that's being generous to you.",
        responses: [
          R("Fair enough.", null, {
            action: () => {
              K.inv.remove("q_pmid_ml_cheque", 1);
              K.inv.addScrip(150);
              K.q.setFlag("pmid_claim_paid", true);
              K.q.complete("pmid_q_claim");
            },
            end: true,
          }),
        ],
      },
      keep: {
        speaker: "Old Hector",
        text: "...Of course. Of course you will. You know, you'd have fit right in up there in the tower. Get out of my section.",
        responses: [
          R("Your loss, old man.", null, {
            action: () => K.q.complete("pmid_q_claim"),
            end: true,
          }),
        ],
      },
      after: {
        speaker: "Old Hector",
        text: () =>
          K.q.flag("pmid_claim_kept")
            ? "Don't you have a cheque to not cash somewhere?"
            : "Look at it. APPROVED. Every night before I sleep. Best eleven-forty I ever spent.",
        responses: [R("Take care, Hector.", null, { end: true })],
      },
    },
  });
