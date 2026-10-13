// play-inline-560 03 — next
// Lines 552-897 of readable/play-inline-560.pretty.js (statement-aligned).
  L.hook("register", function () {
    const member = () => !!L.flag("neon_guard_member");
    L.dialogue("dlg_neon_sarge", {
      start: () => (L.flag("met_mulroney") ? "hello" : "first"),
      nodes: {
        first: {
          text: "Barracks. [A big, broken-nosed man in patched combat armour doesn't look up from the rifle he's cleaning.] Sergeant Otis Mulroney. I run the armory, the duty roster and the bounty board, and I do all three better than anybody alive. Low bar. State your business.",
          onEnter() {
            L.setFlag("met_mulroney");
          },
          responses: [
            { text: "What is this place?", next: "place" },
            { text: "Just looking around.", next: "hello" },
          ],
        },
        place: {
          text: "Used to be a subway entrance and a recruiting office upstairs. The Army had it, then the bombs had it, then the Maniacs had it. Now the Guard has it. Bunks for the night watch, the armory cage, the board. Anybody wants to hurt the Neon, they get planned against in this room.",
          responses: [{ text: "Got it.", next: "hello" }],
        },
        hello: {
          text: () => (
            (DLG.paid = null),
            L.flag("neon_guard_sergeant")
              ? pick([
                  "Sergeant. Coffee's cold, board's fresh.",
                  "Sergeant on deck. What do you need?",
                ])
              : member()
                ? pick([
                    "Guardsman. Boots clean? Rifle clean? Conscience optional.",
                    "Recruit. What's it gonna be?",
                  ])
                : pick([
                    "Civilian. You lost?",
                    "Barracks is for the Guard. You're not the Guard. What do you want?",
                  ])
          ),
          responses: [
            {
              text: "Let's see the armory.",
              cond: member,
              barter: true,
              end: true,
            },
            {
              text: "Can I buy from the armory?",
              cond: () => !member(),
              next: "members",
            },
            {
              text: "Anything on the bounty board?",
              cond: () => member() && !Q.isActive(QID),
              next: "board",
            },
            {
              text: () => {
                const c = C();
                return (
                  "About the contract — " +
                  (c ? c.what + " at " + c.place : "…") +
                  "."
                );
              },
              cond: () => Q.stage(QID) === "hunt",
              next: "remind",
            },
            {
              text: "Contract's done. They're dead.",
              cond: () => Q.stage(QID) === "report",
              next: "pay",
            },
            { text: "How am I doing?", cond: member, next: "record" },
            {
              text: "How do I join the Guard?",
              cond: () => !member(),
              next: "join",
            },
            { text: "Carry on, Sergeant." },
          ],
        },
        members: {
          text: "Armory's for sworn Guard only. Kincaid's orders, and mine, and the rifles'. Swear in with the Captain at the north gate and I'll sell you anything in that cage at cost. Well. At my cost. Which includes my time. Which is valuable.",
          responses: [{ text: "Fair enough.", next: "hello" }],
        },
        join: {
          text: "Talk to Captain Kincaid, north gate. She'll give you three names off the Mayor's board. Kill them, and you're Guard. Die, and you're also Guard — posthumously. We're not picky about paperwork.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        board: {
          text: () => {
            if (!canTakeContract())
              return "Board's picked clean for today. New notices come in with the morning wagons. Come back tomorrow.";
            if (!DLG.offer || DLG.offerDay !== G.time.day) {
              DLG.offer = newContract();
              DLG.offerDay = G.time.day;
            }
            const c = DLG.offer;
            return c
              ? "Contract. " +
                  c.brief +
                  " " +
                  c.place +
                  ". That's " +
                  c.what +
                  ". Pays " +
                  c.pay +
                  " scrip on proof. You want it?"
              : "Board's empty. Enjoy it. It won't last.";
          },
          responses: [
            {
              text: "I'll take it.",
              cond: () => canTakeContract() && !!DLG.offer,
              action: () => takeOffer(),
              next: "taken",
            },
            { text: "Not today.", next: "hello" },
          ],
        },
        taken: {
          text: () => {
            const c = C();
            return c
              ? "It's in those fancy goggles of yours. " +
                  c.place +
                  ". Bring your own ammo, or buy mine. Mine's better. Mine's also mine."
              : "Hm. The notice blew away. Try again.";
          },
          responses: [{ text: "On my way." }],
        },
        remind: {
          text: () => {
            const c = C();
            if (!c) return "…";
            const left = aliveTargets(c).length;
            return (
              c.place +
              ". " +
              (left === c.ids.length
                ? "All of 'em still breathing, by my reckoning."
                : left + " left, by my reckoning.") +
              " Want to back out? No shame. Some shame. Mostly no."
            );
          },
          responses: [
            { text: "I'm on it." },
            { text: "I'm backing out of this one.", next: "quit" },
          ],
        },
        quit: {
          text: "Fine. I'll send the night watch. They'll complain. Board's closed to you till tomorrow — rules are rules.",
          onEnter() {
            abandonContract();
          },
          responses: [{ text: "Understood." }],
        },
        pay: {
          text: () => {
            const c = DLG.paid || C();
            return c
              ? pick([
                  "Good. Clean work. ",
                  "Heard the shooting from here. Heard it stop. Good. ",
                  "That's one less thing on the avenue. ",
                ]) +
                  c.pay +
                  " scrip, as posted. Guard thanks you, the porters thank you, and I thank you, silently, in my heart, which still works."
              : "Paid. Go.";
          },
          onEnter() {
            DLG.paid = C();
            payContract();
          },
          responses: [
            { text: "Anything else on the board?", next: "board" },
            { text: "Thanks, Sergeant." },
          ],
        },
        record: {
          text: () => {
            const n = Number(L.flag("neon_contracts_done")) || 0;
            return n === 0
              ? "Zero contracts. Zero complaints, zero compliments. Take one off the board and let's see what you are."
              : n < 3
                ? n +
                  " contract" +
                  (n > 1 ? "s" : "") +
                  ". You're not dead, which puts you ahead of the last recruit. Three gets you a bonus."
                : n < 5
                  ? n +
                    " contracts. Solid. Five gets you my marksman's pin. It's very shiny. Don't tell anyone I said shiny."
                  : n < 10
                    ? n +
                      " contracts, and a pin. At ten, I buy you a drink, the Mayor gives a speech, and you pretend to listen."
                    : n +
                      " contracts. You've done more for these streets than the Army ever did. Don't let it get to your head. Get it to your trigger finger.";
          },
          responses: [{ text: "Good to know.", next: "hello" }],
        },
      },
    });
    const DLG = { offer: null, paid: null };
    function takeOffer() {
      const c = DLG.offer;
      DLG.offer = null;
      if (!c) return;
      if (Q.isComplete(QID) || Q.isFailed(QID)) L.STATE.delete(QID);
      cleanupOld();
      L.setFlag("neon_contract_n", c.n);
      L.setFlag("neon_contract", c);
      spawnContract(c);
      Q.start(QID);
      Q.setTracked(QID);
    }

    // actor-less: the barracks bounty board
    L.dialogue("dlg_neon_bounty_board", {
      start: "look",
      nodes: {
        look: {
          text: () => {
            const c = C();
            const done = Number(L.flag("neon_contracts_done")) || 0;
            return (
              "[Three WANTED posters, a duty roster and a clipboard of contract notices, most of them crossed out in red grease pencil.]\n\n" +
              (c
                ? "OPEN CONTRACT #" +
                  c.n +
                  ": " +
                  c.what.toUpperCase() +
                  " — " +
                  c.place.toUpperCase() +
                  ". " +
                  c.pay +
                  " SCRIP. TAKEN BY: " +
                  L.heroName().toUpperCase() +
                  "."
                : canTakeContract()
                  ? "NEW NOTICES POSTED. SEE SGT. MULRONEY."
                  : member()
                    ? "NO NEW NOTICES. NEXT BOARD: TOMORROW MORNING."
                    : "CONTRACTS FOR SWORN GUARD ONLY. APPLY: CAPT. M. KINCAID, NORTH GATE.") +
              (done ? "\n\nCONTRACTS CLOSED BY YOU: " + done + "." : "")
            );
          },
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    // Kincaid points finished bounty hunters at the Sergeant
    const capt = L.DIALOGUES.get("dlg_neon_capt");
    if (
      capt &&
      capt.nodes &&
      capt.nodes.hello &&
      !capt.nodes.hello.responses.some((r) => r._sarge)
    ) {
      capt.nodes.hello.responses.splice(
        Math.max(0, capt.nodes.hello.responses.length - 2),
        0,
        {
          _sarge: true,
          text: "Any more work for the Guard?",
          cond: () =>
            L.alive("neon_sarge") &&
            (Q.isComplete("sq_neon_guard") ||
              (member() && !Q.isActive("sq_neon_guard"))),
          next: "sarge_work",
        },
      );
      // Completability: if Mulroney is not in the world (barracks not built, or he died), Kincaid runs the board herself.
      const sarge = L.DIALOGUES.get("dlg_neon_sarge");
      const names = ["board", "taken", "remind", "quit", "pay"];
      for (const n of names) {
        const src = sarge.nodes[n];
        if (!src) continue;
        const rs = Array.isArray(src.responses)
          ? src.responses.map((r) =>
              Object.assign(
                {},
                r,
                names.indexOf(r.next) >= 0 ? { next: "sg_" + r.next } : null,
              ),
            )
          : src.responses;
        capt.nodes["sg_" + n] = Object.assign({}, src, { responses: rs });
      }
      const noSarge = () => !L.alive("neon_sarge");
      capt.nodes.hello.responses.splice(
        Math.max(0, capt.nodes.hello.responses.length - 2),
        0,
        {
          _sarge: true,
          text: "Mulroney's not at his post. Anything on the bounty board?",
          cond: () => noSarge() && member() && !Q.isActive(QID),
          next: "sg_board",
        },
        {
          _sarge: true,
          text: () => {
            const c = C();
            return (
              "About the contract — " +
              (c ? c.what + " at " + c.place : "…") +
              "."
            );
          },
          cond: () => noSarge() && Q.stage(QID) === "hunt",
          next: "sg_remind",
        },
        {
          _sarge: true,
          text: "Contract's done. They're dead.",
          cond: () => noSarge() && Q.stage(QID) === "report",
          next: "sg_pay",
        },
      );
      capt.nodes.sarge_work = {
        text: "Always. Mulroney runs the contract board down in the barracks — the subway kiosk by the island. One job a day, paid on proof. He'll also sell you guard kit at cost. Tell him I said to stop hoarding the good grenades.",
        responses: [{ text: "I'll see him.", next: "hello" }],
      };
    }
    // Barnaby and the townsfolk now drop the Speakeasy / Oracle rumours
    const bell = L.DIALOGUES.get("dlg_neon_bellhop");
    if (bell && bell.nodes && bell.nodes.subway && !bell.nodes.subway._r) {
      bell.nodes.subway._r = true;
      const prev = bell.nodes.subway.onEnter;
      bell.nodes.subway.onEnter = function (a) {
        if (prev) prev(a);
        L.setFlag("neon_rumor_speakeasy");
      };
    }
    if (bell && bell.nodes && bell.nodes.tour && !bell.nodes.tour._r) {
      bell.nodes.tour._r = true;
      const prev = bell.nodes.tour.onEnter;
      bell.nodes.tour.onEnter = function (a) {
        if (prev) prev(a);
        L.setFlag("neon_rumor_oracle");
      };
    }
  });

  // ==================================================================
  // World, spawn, events, update
  // ==================================================================
