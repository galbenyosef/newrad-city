// play-inline-222 04 — next
// Lines 475-985 of readable/play-inline-222.pretty.js (statement-aligned).
  function defineDialogue() {
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const R = (id, tree) =>
      PH.safe("dlg " + id, () => G.dialogue.register(id, tree));
    const hm = "ph_q_huddled",
      sr = "ph_q_sugar",
      qu = "ph_q_quarantine";
    R("ph_dlg_augustine", {
      start: () => (PH.flag("ph_processed") ? "hub" : "intake"),
      nodes: {
        intake: {
          speaker: "Registrar Augustine Vell",
          text: "Next! Step up to the desk, don't mind the chalk. Name, place of origin, and — forgive me, it's on the form — any burns, sores or fevers?",
          responses: [
            {
              text: "I slept through the whole thing in a Civil Defense cryo tube. No burns. Some freezer burn.",
              next: "processed",
            },
            { text: "Forms? I'm not filling out any forms.", next: "noforms" },
            {
              text: "[Presence 6] Registrar, I believe we've already met. Surely a formality between old friends...",
              check: { attr: "presence", value: 6 },
              next: "charm",
              failNext: "charm_fail",
            },
          ],
        },
        noforms: {
          text: "Nobody fills them out. I fill them out. I have filled out four thousand one hundred and sixteen of them. You'll be the seventeenth. There.",
          onEnter() {
            PH.setFlag("ph_processed");
            PH.give("ph_papers", 1);
          },
          responses: [{ text: "That's... it?", next: "processed2" }],
        },
        processed: {
          text:
            "A sleeper! Twenty-two years in a tube, and you still came to the front door of America. There." +
            " [He stamps a card with tremendous ceremony.] Welcome to the Registry. You are now, officially, somebody.",
          onEnter() {
            PH.setFlag("ph_processed");
            PH.give("ph_papers", 1);
            PH.xp(10, "Registered at Ellis Island");
          },
          responses: [
            { text: "What is this place?", next: "place" },
            { text: "Thanks. I'll look around.", next: "hub" },
          ],
        },
        processed2: {
          text: "That's it. Twelve million people came up those stairs expecting a door slammed in their face. Here, the door stays open. Welcome to the Registry.",
          responses: [
            { text: "What is this place?", next: "place" },
            { text: "Thanks.", next: "hub" },
          ],
        },
        charm: {
          text: "[He squints, then laughs — a dry rattle.] Old friends. Ha! Fine, fine. Nobody has flattered me since the Johnson administration. You're processed.",
          onEnter() {
            PH.setFlag("ph_processed");
            PH.give("ph_papers", 1);
            PH.xp(20, "Charmed the Registrar");
          },
          responses: [{ text: "What is this place?", next: "place" }],
        },
        charm_fail: {
          text: "I've never seen you in my life, and I have seen EVERYONE. Name, origin, condition, please.",
          responses: [
            {
              text: "A cryo tube under Civic Center. Intact.",
              next: "processed",
            },
          ],
        },
        place: {
          learn: "ph_lk_ellis_term",
          text: "Ellis Island. The front door of America, once. I was a park ranger — gave the tour, sold the souvenir thimbles. Eleven thousand thimbles; the museum teletype still answers to THIMBLE, God help it. When the bombs fell, the burned came here because the Hall still had a roof and a door that shut, and it was a long way from the fires. We never stopped taking them in. The burned, the lost, the hungry. Anyone, really.",
          responses: [
            { text: "And you run it?", next: "run" },
            { text: "Back to business.", next: "hub" },
          ],
        },
        run: {
          text: "I REGISTER it. Big difference. Tomas trades, Doc Tran patches, Rosaria feeds, Sal minds the luggage — twenty-two years of luggage — and I write it all down. Somebody should remember who came through.",
          responses: [{ text: "Back to business.", next: "hub" }],
        },
        hub: {
          speaker: "Registrar Augustine Vell",
          text: () =>
            qActive(hm) && PH.flag("nadia_freed")
              ? "Is that — did you — tell me you found her."
              : "The Registry is open. How can the Registrar help you?",
          responses: [
            {
              text: "Nadia is free. She's on her way home.",
              cond: () => qActive(hm) && PH.flag("nadia_freed"),
              next: "hm_done",
            },
            {
              text: "I found a skiff pilot named Nadia locked in a pirate brig. She's free now.",
              cond: () => !qActive(hm) && !qDone(hm) && PH.flag("nadia_freed"),
              next: "hm_pre",
            },
            {
              text: "You look worried. Something wrong?",
              cond: () => !qActive(hm) && !qDone(hm),
              next: "hm_offer",
            },
            {
              text: "About the pirates...",
              cond: () => qActive(hm) && !PH.flag("nadia_freed"),
              next: "hm_status",
            },
            {
              text: "Something is moaning upstairs.",
              cond: () => !qActive(qu) && !qDone(qu),
              next: "qu_offer",
            },
            {
              text: "The quarantine ward is clear.",
              cond: () => qActive(qu) && PH.flag("quarantine_cleared"),
              next: "qu_done",
            },
            { text: "What is this place?", next: "place" },
            { text: "Goodbye." },
          ],
        },
        hm_offer: {
          text: "Worried. Yes. Nadia Osei — our skiff pilot; she came through this hall as a little girl on the morning of the bombs — didn't come back with the dawn run three days ago. Pirate colours off the Navy Yard. Some fool in an admiral's hat calls himself the Commodore and has a whole battleship to hide in. I need her back. I have no one to send.",
          responses: [
            { text: "I'll bring her back.", next: "hm_accept" },
            { text: "What's in it for me?", next: "hm_pay" },
            { text: "Not my problem.", next: "hm_decline" },
          ],
        },
        hm_pay: {
          text: "Scrip, what the Registry can spare. And the key to our Records Room — old-world archives, the old museum safe, a few things the Board of Inquiry confiscated in 1954 and never gave back. Rangers' honour.",
          responses: [
            { text: "Deal. Where's this battleship?", next: "hm_accept" },
            {
              text: "[Trade 40] Make it worth the trip.",
              check: { skill: "trade", value: 40 },
              next: "hm_barter",
              failNext: "hm_barter_fail",
            },
            { text: "I'll think about it." },
          ],
        },
        hm_barter: {
          text: "...Two hundred scrip, the key, and I will personally never make you fill out another form. Final offer.",
          onEnter() {
            PH.setFlag("hm_bonus");
          },
          responses: [{ text: "Deal.", next: "hm_accept" }],
        },
        hm_barter_fail: {
          text: "I'm a registrar, not a bank. The offer stands.",
          responses: [
            { text: "Fine. Deal.", next: "hm_accept" },
            { text: "I'll think about it." },
          ],
        },
        hm_accept: {
          text: "The Brooklyn Navy Yard — the old drydock. You can't miss her: the USS Hudson, eight hundred feet of angry grey steel. Take the harbor skiff from our dock to the Battery and cross the bridge, or however you sleepers get around. And — bring her home, please.",
          onEnter() {
            qStart(hm);
          },
          responses: [{ text: "I'll find her." }],
        },
        hm_decline: {
          text: "No. No, of course. Nobody's problem. That's always been the trouble with this city.",
          responses: [
            { text: "...Fine. Tell me about her.", next: "hm_accept" },
            { text: "Goodbye." },
          ],
        },
        hm_status: {
          text: "The USS Hudson, in the Navy Yard drydock. The Commodore keeps prisoners in the old brig, I'd wager — pirates love a brig. Please hurry.",
          responses: [{ text: "On my way." }],
        },
        hm_done: {
          text: '[For a moment he says nothing at all. Then he opens the Book of Arrivals and writes, slowly, in his best hand.] "Returned: Nadia Osei. Brought home by a stranger who was a stranger no longer." Here. The key, as promised. You are always welcome in this Hall.',
          onEnter() {
            PH.give("ph_key_ellis_records", 1);
            if (PH.flag("hm_bonus")) PH.addScrip(50);
            qComplete(hm);
            PH.setFlag("registry_friend");
          },
          responses: [{ text: "She was worth it." }],
        },
        hm_pre: {
          text: "You — Nadia? Our Nadia? I was about to beg a stranger to go after her, and a stranger had already gone. [He opens the Book of Arrivals.] Here. The Records Room key. It was meant as payment; take it as thanks.",
          onEnter() {
            qStart(hm);
            PH.give("ph_key_ellis_records", 1);
            qComplete(hm);
            PH.setFlag("registry_friend");
          },
          responses: [{ text: "Right place, right time." }],
        },
        qu_offer: {
          text: "Dormitory C. Our quarantine ward. Three of our own lost their minds this winter — the sickness took them. Beppe, Old Marta, the Kowalski boy. Doc barricaded them in. It is... not kind, keeping them like that. If you have the stomach for it, I'll give you leave to open the ward and end it.",
          responses: [
            { text: "I'll take care of it.", next: "qu_accept" },
            { text: "Not today." },
          ],
        },
        qu_accept: {
          text: "The ward is on the gallery, north side, far end. Here — the ward key. Be quick. Be merciful. And close the door behind you.",
          onEnter() {
            PH.setFlag("ellis_quarantine_ok");
            if (!PH.hasItem("ph_key_ward")) PH.give("ph_key_ward", 1);
            qStart(qu);
          },
          responses: [{ text: "Understood." }],
        },
        qu_done: {
          text: "Thank you. I'll write their names in the Book tonight. Their real names. Take this — for the ammunition, and the nightmares.",
          onEnter() {
            qComplete(qu);
          },
          responses: [{ text: "Rest easy, Registrar." }],
        },
      },
    });
    R("ph_dlg_tomas", {
      start: "hello",
      nodes: {
        hello: {
          speaker: 'Tomas "Customs" Kowalczyk',
          text: () =>
            "Customs House, declare your goods! Kidding. Nobody declares anything anymore. " +
            (PH.flag("registry_friend")
              ? "For the one who brought Nadia home — friend prices."
              : "Buying, selling, overpaying?"),
          responses: [
            { text: "Let's trade.", barter: true },
            { text: 'Why "Customs"?', next: "why" },
            { text: "Heard anything about the Sugar Works?", next: "domino" },
            { text: "Later." },
          ],
        },
        why: {
          text: "Old-world I was a customs inspector right here. Ellis was a museum by then, but the harbor still needed inspecting. I inspected the bombs coming in. Very thorough. Didn't stop any.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Later." },
          ],
        },
        domino: {
          text: "Big sugar factory up in Williamsburg — the Brooklyn Sugar Works. Brutes moved in — a whole tribe of 'em, eating Freedom Flakes straight out of the silos. Their chief's called Sweet Tooth. Grows a new tooth every time he loses one, they say. Doc Tran's been asking about that place.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Thanks." },
          ],
        },
      },
    });
    R("ph_dlg_doc", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Doc Minh Tran",
          text: () =>
            "Doc Tran. Stitches, tonic, second opinions. " +
            (G.player.hp < G.player.maxHp * 0.6
              ? "You look like you need the first one."
              : "What seems to be the trouble?"),
          responses: [
            {
              text: "Patch me up. (25 scrip)",
              cond: () => G.player.hp < G.player.maxHp,
              next: "heal",
            },
            {
              text: "Flush my radiation. (35 scrip)",
              cond: () => G.player.rads > 0,
              next: "rads",
            },
            { text: "Show me your supplies.", barter: true },
            {
              text: "You need something?",
              cond: () => !qActive(sr) && !qDone(sr),
              next: "sr_offer",
            },
            {
              text: "I have your Pure Cane Reserve.",
              cond: () => qActive(sr) && PH.hasItem("ph_sugar_crate"),
              next: "sr_done",
            },
            {
              text: "About that sugar...",
              cond: () => qActive(sr) && !PH.hasItem("ph_sugar_crate"),
              next: "sr_status",
            },
            { text: "Goodbye." },
          ],
        },
        heal: {
          text: "Hold still. [Needle, thread, a swig of something for both of you.] Done.",
          onEnter() {
            if (pay(PH.flag("doc_discount") ? 10 : 25)) {
              G.player.heal(G.player.maxHp);
              PH.sfx("inject");
            }
          },
          responses: [{ text: "Thanks, Doc." }],
        },
        rads: {
          text: "Prussian Blue and a cot to lie on. Most of us here gave up counting years ago; I keep it for newcomers and the sentimental. [An hour passes.] Clean as a baby.",
          onEnter() {
            if (pay(PH.flag("doc_discount") ? 15 : 35)) {
              G.player.rads = 0;
              G.events.emit("radsChanged", 0, 0);
              PH.sfx("iodine_tabs");
            }
          },
          responses: [{ text: "Thanks." }],
        },
        sr_offer: {
          text: 'I need sugar. Real sugar — not Freedom Flakes, not anything that came off that additive line. Dextrose drips keep our radiation-sick old ones clear in the head a few years longer; the dirty stuff makes it worse. There was a sealed crate of old-world cane at the Brooklyn Sugar Works — "Founder\'s Reserve". The brutes live there now.',
          responses: [
            { text: "I'll get it for you.", next: "sr_accept" },
            {
              text: "[Medicine 50] Glucose against radiation dementia? Show me your notes.",
              check: { skill: "medicine", value: 50 },
              next: "sr_med",
              failNext: "sr_accept",
            },
            { text: "Brutes? No thanks." },
          ],
        },
        sr_med: {
          text: "You actually read them. Huh. Yes — glucose loading plus low-dose Iodine tabs. It buys time. Here, take these, you'll need them more than my notes will. And for a colleague: half price, always.",
          onEnter() {
            PH.setFlag("doc_discount");
            PH.give(PH.item("rally_tonic") || "rally_tonic", 2);
            PH.xp(30, "Medicine");
          },
          responses: [{ text: "I'll get your sugar.", next: "sr_accept" }],
        },
        sr_accept: {
          text: "Williamsburg waterfront, across the East River. Look for the SUGAR WORKS sign — you can't miss the sign. The Reserve would be in Quality Control. Their chief, Sweet Tooth, probably keeps the key. Probably ON him. Probably in a very sticky place.",
          onEnter() {
            qStart(sr);
          },
          responses: [{ text: "Charming." }],
        },
        sr_status: {
          text: "Brooklyn Sugar Works. QC lab. Founder's Reserve. And don't eat any sugar that glows.",
          responses: [{ text: "Got it." }],
        },
        sr_done: {
          text: "[She pries the lid and breathes in.] Oh. Oh, that is SUGAR. Twenty-two years and it still smells like a birthday. This will keep Old Tom and the Lindqvist sisters themselves for years. Here — take these, and my thanks.",
          onEnter() {
            PH.take("ph_sugar_crate", 1);
            qComplete(sr);
            PH.setFlag("doc_discount");
          },
          responses: [{ text: "Happy birthday, Doc." }],
        },
      },
    });
    R("ph_dlg_rosaria", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Mama Rosaria",
          text: "Sit, sit! You're too thin. Everybody who comes up those stairs is too thin. Soup is five scrip. What's in it? Love. And shellback.",
          responses: [
            { text: "I'll take some food.", barter: true },
            { text: "Tell me about the Registry.", next: "reg" },
            { text: "Heard any gossip?", next: "gossip" },
            { text: "Bye, Mama." },
          ],
        },
        reg: {
          text: "Augustine keeps the book, Tomas keeps the scrip, Doc keeps us breathing, and I keep everybody fed so they don't kill each other. Sal keeps the luggage. Twenty-two years, he still thinks somebody's coming back for trunk eighteen ninety-two.",
          responses: [{ text: "Gossip?", next: "gossip" }, { text: "Bye." }],
        },
        gossip: {
          text: "The pirates on that big boat in Brooklyn took our Nadia. And the brutes at the sugar factory — ay, they sing at night. Sugar songs. You can hear them from the Battery when the wind is right.",
          responses: [
            { text: "Food, please.", barter: true },
            { text: "Bye." },
          ],
        },
      },
    });
    R("ph_dlg_sal", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Porter Sal",
          text: "Baggage check! Claim ticket? No? Nobody ever has the ticket. I've got twenty-two years of luggage and not one ticket.",
          responses: [
            { text: "Why keep it all?", next: "why" },
            { text: "Anything interesting in there?", next: "loot" },
            { text: "So long." },
          ],
        },
        why: {
          text: "Because somebody packed it. Somebody chose what to carry into a new life. You don't just throw that out. Trunk eighteen ninety-two, now — belonged to a little girl. Pink ribbon on the handle. I'm still holding it for her.",
          responses: [
            { text: "That's... kind of beautiful." },
            { text: "Anything interesting?", next: "loot" },
          ],
        },
        loot: {
          text: "The unclaimed trunks by the stair and under the east columns — go ahead, look. If you find a claim ticket, tell me. If you find a pink ribbon, you put it BACK.",
          responses: [{ text: "Deal." }],
        },
      },
    });
    R("ph_dlg_nadia", {
      start: () =>
        actor("ph_nadia") &&
        actor("ph_nadia").pos.x > 6000 &&
        !PH.flag("hudson_cell_open")
          ? "locked"
          : PH.flag("nadia_freed")
            ? PH.flag("nadia_home")
              ? "home"
              : "go"
            : "freed",
      nodes: {
        locked: {
          speaker: "Nadia Osei",
          text: "Hey — HEY. You're not one of them. Get me out of here! The sentry keeps the brig key on his belt. The Commodore's got a ring that opens it too.",
          responses: [{ text: "Hang on." }],
        },
        freed: {
          speaker: "Nadia Osei",
          text: "You opened it. You actually — Augustine sent you, didn't he? That old stack of paperwork. [She grins, wide and gap-toothed, a harbor pilot's grin.] I know the ship: there's a hatch aft, by the quarterdeck. I'll find my own way off. Go give the Commodore my regards. Loudly.",
          responses: [
            {
              text: "Get home safe. Tell Augustine I'm right behind you.",
              next: "go_now",
            },
            { text: "The Commodore — where is he?", next: "intel" },
          ],
        },
        intel: {
          text: 'On the bridge. Always on the bridge — he likes the view. Up through the forward hall, up the ladders past the Combat Center. He wears the magazine key round his neck like a medal. Whatever\'s in that magazine, he calls it "the restricted munitions" and grins.',
          responses: [{ text: "Go home. I'll handle him.", next: "go_now" }],
        },
        go_now: {
          text: "Don't die on this rustbucket. It's not a good place for it.",
          onEnter() {
            PH.freeNadia();
          },
          responses: [{ text: "Go." }],
        },
        go: {
          speaker: "Nadia Osei",
          text: "I'm going, I'm going! Quarterdeck hatch, then the skiff. See you at the Hall.",
          responses: [{ text: "Go." }],
        },
        home: {
          speaker: "Nadia Osei",
          text: () =>
            "The skiff's running again — dawn run, every day, like my mother before me. " +
            (PH.flag("nadia_thanked")
              ? "You ever need a ride, it's free. Forever."
              : "Here. My mother's compass. Kept it through the whole mess. It should go to someone who knows the way."),
          onEnter() {
            if (!PH.flag("nadia_thanked")) {
              PH.setFlag("nadia_thanked");
              PH.addScrip(60);
              PH.give(PH.item("souvenir_paperweight") || "scrip", 1);
              PH.standing(20, "Brought Nadia home");
            }
          },
          responses: [{ text: "Safe sailing, Nadia." }],
        },
      },
    });
    R("ph_dlg_ellis_guard", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Registry Guard",
          text: () =>
            PH.flag("ph_processed")
              ? "Papers are in order. Welcome back."
              : "New arrival? Registrar's at the big desk upstairs. Everyone gets registered. Everyone gets soup.",
          responses: [{ text: "Thanks." }],
        },
      },
    });
    R("ph_dlg_resident", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Registry Resident",
          text: () =>
            [
              "Came through these doors in '71. Haven't found a reason to leave.",
              "New face, huh? Don't worry. We don't bite. The ones that bite are upstairs, locked in.",
              "Rosaria's soup is terrible. Don't tell her I said that. Don't tell her I said anything.",
              "Augustine wrote my name in the Book. First time anybody wrote my name anywhere.",
            ][Math.floor(Math.random() * 4)],
          responses: [{ text: "Take care." }],
        },
      },
    });
  }

  // =====================================================================
  // QUESTS
  // =====================================================================
