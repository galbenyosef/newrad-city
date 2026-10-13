// play-inline-387 05 — next
// Lines 1263-1732 of readable/play-inline-387.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "ppn_special_letter",
      type: "note",
      name: "Special Delivery Letter",
      title: "Special Delivery Letter (sealed)",
      text: LETTER_TEXT,
      weight: 0,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: "A sealed airmail envelope with a red SPECIAL DELIVERY stamp, postmarked Keflavík, Iceland, March 4, 1967. It has been waiting for a carrier for twenty-two years.",
    });
    K.defineItem({
      id: "ppn_carrier_badge",
      type: "misc",
      name: "Temporary Carrier Badge",
      weight: 0,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: 'A tin badge on a lanyard: U.S. POST OFFICE — TEMPORARY CARRIER — GENERAL POST OFFICE, NEW YORK 1. The Farley security Patrolmen read it as "authorised personnel."',
    });
    K.defineItem({
      id: "ppn_receipt",
      type: "misc",
      name: "Return Receipt (Signed)",
      weight: 0,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: 'A green return-receipt card, signed in a shaky operator\'s hand: "M. Kowalczyk." Proof of delivery.',
    });
    K.defineItem({
      id: "ppn_stamp_album",
      type: "misc",
      name: "Old-world Stamp Album",
      weight: 1,
      value: 260,
      tags: ["valuable", "unique"],
      desc: 'The Postmaster\'s own collection: Liberty Bells, Atomic Age commemoratives, a full sheet of the 1966 "Civil Defense Week" issue and one inverted rotorcraft. Collectors at the Neon would kill for it. Collectors in New York just might.',
    });
    K.defineItem({
      id: "ppn_postmaster_key",
      type: "key",
      name: "Postmaster's Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      learn: "ppn_term_pm",
      desc: 'A brass key on a ring with a cardboard tag: "P.M. OFFICE — DO NOT DUPLICATE." On the back of the tag, in pencil: "teletype — ZIPCODE".',
    });
    K.defineItem({
      id: "ppn_mail_rail_pass",
      type: "misc",
      name: "Mail Rail Motorman's Pass",
      weight: 0,
      value: 15,
      tags: ["junk"],
      desc: "A laminated pass for the Penn Terminal mail railway. The photo has faded to a thumbprint.",
    });

    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ppn_rounds",
        name: "Neither Snow Nor Rain",
        giver: "M.I.L.E.S.",
        location: "James A. Farley Post Office",
        desc: "A clerk Patrolman at the General Post Office has one piece of First-Class mail left undelivered — a Special Delivery letter from the Iceland garrison, held in the Dead Letter Office since March 4, 1967. Regulation 4-C requires a delivery attempt.",
        stages: [
          {
            id: "retrieve",
            text: "Retrieve the Special Delivery letter from the Dead Letter Office (Farley mezzanine).",
            markers: [
              () => {
                const a = PV.anchor("farley_post_office", "letter");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Dead Letter Office",
                      interior: "farley_post_office",
                    }
                  : null;
              },
            ],
          },
          {
            id: "deliver",
            text: "Deliver the letter to Miss Mabel Kowalczyk, switchboard operator at the Hotel Pennsylvania.",
            markers: [
              () => {
                const a = PV.anchor("hotel_pennsylvania", "dottie");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Switchboard",
                      interior: "hotel_pennsylvania",
                    }
                  : null;
              },
              () => {
                const a = PV.anchor("hotel_pennsylvania", "door");
                return a
                  ? { x: a.x, z: a.z, label: "Hotel Pennsylvania" }
                  : null;
              },
            ],
          },
          {
            id: "receipt",
            text: "Bring the signed return receipt to M.I.L.E.S. at the General Post Office.",
            markers: [
              { npc: "ppn_miles", label: "M.I.L.E.S." },
              () => {
                const a = PV.anchor("farley_post_office", "door");
                return a
                  ? { x: a.x, z: a.z, label: "General Post Office" }
                  : null;
              },
            ],
          },
        ],
        rewards: { xp: 350 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const pname = () =>
      String(
        (G.HERO && G.HERO.name) || (G.player && G.player.name) || "CARRIER",
      ).toUpperCase();
    const startQuest = () => {
      q.start("ppn_rounds");
      if (K.has("ppn_special_letter")) q.set("ppn_rounds", "deliver");
      if (K.has("ppn_receipt")) q.set("ppn_rounds", "receipt");
    };
    const certify = () => {
      if (!K.has("ppn_carrier_badge")) K.give("ppn_carrier_badge", 1);
      PV.setFlag("fa_carrier", true);
      if (PV.faPacify) PV.faPacify(true);
    };
    const reward = () => {
      if (!q.active("ppn_rounds")) return;
      K.take("ppn_receipt", 1);
      K.scrip(PV.flag("fa_backpay") ? 300 : 200);
      K.give("ppn_stamp_album", 1);
      K.give("rally_tonic", 2);
      K.standing(
        PV.flag("ho_dottie_cruel") ? 0 : 20,
        "Delivered the last letter",
      );
      PV.setFlag("fa_delivered", true);
      q.complete("ppn_rounds");
    };
    const examAns = (ok) => () => {
      PV.setFlag("fa_exam", (PV.flag("fa_exam") || 0) + (ok ? 1 : 0));
    };
    const MILES = "M.I.L.E.S.";
    G.dialogue.register("ppn_dlg_miles", {
      start: () => {
        if (q.done("ppn_rounds")) return "after";
        if (K.has("ppn_receipt")) return "receipt";
        if (q.active("ppn_rounds"))
          return K.has("ppn_special_letter") ? "go" : "again";
        return PV.flag("fa_met_miles") ? "hello2" : "hello";
      },
      nodes: {
        hello: {
          speaker: MILES,
          onEnter: () => PV.setFlag("fa_met_miles", true),
          text: "[Behind the brass grille of window 12, GENERAL DELIVERY, a Patrolman in faded postal blue swivels its dome toward you. A ticket dispenser on its chest spits out a slip: 4,113.] NEXT CUSTOMER, PLEASE. WELCOME TO THE JAMES A. FARLEY GENERAL POST OFFICE. CURRENT WAIT TIME: EIGHT THOUSAND AND NINETY-ONE DAYS. THANK YOU FOR YOUR PATIENCE.",
          responses: [
            { text: "Seventy-three thousand days?", next: "wait" },
            { text: "Any mail for me?", next: "mail" },
            { text: "What happened here?", next: "history" },
            { text: "I'll come back later.", end: true },
          ],
        },
        hello2: {
          speaker: MILES,
          text: "NEXT CUSTOMER, PLEASE. OH. IT IS YOU AGAIN. YOUR NUMBER HAS BEEN CALLED. [It has not.]",
          responses: [
            { text: "Tell me about the undelivered letter.", next: "dead" },
            { text: "Any mail for me?", next: "mail" },
            { text: "Goodbye.", end: true },
          ],
        },
        wait: {
          speaker: MILES,
          text: "THE GENERAL POST OFFICE HAS OPERATED AT REDUCED STAFFING SINCE 03-05-1967. HUMAN STAFF: ZERO. CUSTOMERS: ZERO. MAIL VOLUME: ZERO. SERVICE STANDARD: MAINTAINED. [Its pincer taps a brass bell. Ding.]",
          responses: [
            { text: "What happened on 03-05-1967?", next: "history" },
            { text: "Any mail for me?", next: "mail" },
          ],
        },
        mail: {
          speaker: MILES,
          text: () =>
            'PLEASE STATE NAME. [...] SEARCHING. [A long whirr from somewhere behind the wall.] NO MAIL FOR "' +
            pname() +
            '." HAVE YOU CONSIDERED HAVING AN ADDRESS? IT HELPS.',
          responses: [
            { text: "Very funny.", next: "history" },
            { text: "Goodbye.", end: true },
          ],
        },
        history: {
          speaker: MILES,
          text: 'AT 09:47 ON 03-05-1967 THE POSTMASTER GENERAL\'S CONTINGENCY DIRECTIVE 12 ENTERED EFFECT: "THE MAIL MUST GO THROUGH." SORTING HAS CONTINUED WITHOUT INTERRUPTION. ALL CITY ROUTES REPORT: ADDRESSEE UNKNOWN. ALL MAIL HAS BEEN FORWARDED TO THE DEAD LETTER OFFICE. EFFICIENCY: ONE HUNDRED PERCENT.',
          responses: [
            {
              text: "So every letter ended up in the Dead Letter Office?",
              next: "dead",
            },
          ],
        },
        dead: {
          speaker: MILES,
          text: "CORRECT. ONE ITEM REMAINS UNRESOLVED. FIRST-CLASS, SPECIAL DELIVERY, POSTMARKED KEFLAVIK, ICELAND, 03-04-1967. ADDRESSEE: MISS MABEL KOWALCZYK, HOTEL PENNSYLVANIA, 33RD STREET. DELIVERY ATTEMPTS: ZERO. REGULATION 4-C REQUIRES A DELIVERY ATTEMPT BY A CERTIFIED CARRIER. CERTIFIED CARRIERS AVAILABLE: ZERO. WOULD YOU LIKE TO APPLY?",
          responses: [
            { text: "I'll deliver it.", next: "apply", action: startQuest },
            { text: "Why not send one of your robots?", next: "why" },
            {
              text: "The Hotel Pennsylvania? That's by Penn Station. Nobody's there.",
              next: "nobody",
            },
            { text: "Not interested.", end: true },
          ],
        },
        why: {
          speaker: MILES,
          text: 'PATROLMAN UNITS ARE BOUND TO THIS FACILITY BY SECURITY PERIMETER DIRECTIVE 9. ADDITIONALLY, THE LAST CARRIER REPORT FROM THAT ADDRESS READS, QUOTE: "HOTEL CRAWLING WITH MANIACS. REFUSE TO GO BACK. TELL MY WIFE I LOVE HER." END QUOTE. THAT CARRIER IS NOW ON EXTENDED LEAVE.',
          responses: [
            {
              text: "Fine. I'll deliver it.",
              next: "apply",
              action: startQuest,
            },
            { text: "No thanks.", end: true },
          ],
        },
        nobody: {
          speaker: MILES,
          text: "THE ADDRESSEE HAS NOT FILED A CHANGE-OF-ADDRESS FORM. UNDER REGULATION 4-C, SHE THEREFORE STILL LIVES THERE. [Its dome tilts.] REGULATIONS ARE VERY COMFORTING. YOU SHOULD TRY THEM.",
          responses: [
            {
              text: "Fine. I'll deliver it.",
              next: "apply",
              action: startQuest,
            },
            { text: "No thanks.", end: true },
          ],
        },
        apply: {
          speaker: MILES,
          text: "EXCELLENT. THE LETTER IS ON THE HOLD SHELF IN THE DEAD LETTER OFFICE, MEZZANINE LEVEL. WARNING: THE WORKROOM FLOOR IS A RESTRICTED AREA. SECURITY UNITS WILL REMOVE UNCERTIFIED PERSONNEL WITH FORCE. TO BECOME CERTIFIED, PLEASE COMPLETE THE CIVIL SERVICE CARRIER EXAMINATION. IT TAKES FORTY MINUTES. [Pause.] THREE QUESTIONS. I ROUNDED UP.",
          responses: [
            {
              text: "Let's take the exam.",
              next: "exam1",
              action: () => PV.setFlag("fa_exam", 0),
              cond: () => !PV.flag("fa_carrier"),
            },
            {
              text: "[Electronics 50] Or I could just update your personnel records from here.",
              check: { skill: "electronics", value: 50 },
              next: "hack",
              failNext: "hack_fail",
              cond: () => !PV.flag("fa_carrier"),
            },
            { text: "I'll get it my own way.", end: true },
          ],
        },
        hack: {
          speaker: MILES,
          onEnter: () => {
            certify();
            K.xp(40, "Rewrote the Farley personnel file");
          },
          text:
            "[You reach through the grille and pop the service hatch on its back. Two jumpers later:] ...PERSONNEL RECORD UPDATED. WELCOME BACK, SENIOR CARRIER " +
            "[NAME FIELD CORRUPTED]" +
            ". YOUR BADGE HAS BEEN REPRINTED. [A tin badge clanks into the tray.] SECURITY UNITS HAVE BEEN NOTIFIED.",
          responses: [{ text: "Thanks. I'll get the letter.", end: true }],
        },
        hack_fail: {
          speaker: MILES,
          text: '[Sparks. The Patrolman\'s dome spins a full revolution.] TAMPERING WITH POSTAL EQUIPMENT IS A FEDERAL OFFENCE. THIS INCIDENT HAS BEEN LOGGED. [It prints a slip. The slip says "LOGGED."] YOU MAY STILL TAKE THE EXAMINATION.',
          responses: [
            {
              text: "Fine. The exam.",
              next: "exam1",
              action: () => PV.setFlag("fa_exam", 0),
            },
            { text: "Never mind.", end: true },
          ],
        },
        exam1: {
          speaker: MILES,
          text: 'QUESTION ONE. A LETTER IS ADDRESSED TO "OCCUPANT." THE OCCUPANT IS A PILE OF ASH. THE CORRECT ACTION IS:',
          responses: [
            {
              text: "Deliver it to the ash.",
              next: "exam2",
              action: examAns(true),
            },
            {
              text: "Return to sender.",
              next: "exam2",
              action: examAns(false),
            },
            {
              text: "Read it. The ash won't mind.",
              next: "exam2",
              action: examAns(false),
            },
          ],
        },
        exam2: {
          speaker: MILES,
          text: "QUESTION TWO. DURING YOUR ROUTE YOU ARE ATTACKED BY A DOG. THE DOG IS ON FIRE. THE DOG HAS TWO HEADS. YOU:",
          responses: [
            { text: "Put out the dog.", next: "exam3", action: examAns(false) },
            {
              text: "Finish the route. The mail must go through.",
              next: "exam3",
              action: examAns(true),
            },
            { text: "Run.", next: "exam3", action: examAns(false) },
          ],
        },
        exam3: {
          speaker: MILES,
          text: "QUESTION THREE. WHAT WAS THE FIRST-CLASS POSTAGE RATE FOR A ONE-OUNCE LETTER, AS OF MARCH 1967?",
          responses: [
            { text: "Four cents.", next: "grade", action: examAns(false) },
            { text: "One scrip.", next: "grade", action: examAns(false) },
            {
              text: "[Wits 6] Fourteen ninety-five. Wartime inflation.",
              check: { attr: "wits", value: 6 },
              next: "grade",
              failNext: "grade",
              action: examAns(true),
            },
            {
              text: "Fourteen dollars and ninety-five cents?",
              next: "grade",
              action: examAns(true),
            },
          ],
        },
        grade: {
          speaker: MILES,
          text: () =>
            "GRADING. [It prints a long strip of paper, reads it, and prints another one.] SCORE: " +
            (PV.flag("fa_exam") || 0) +
            " OUT OF 3. " +
            ((PV.flag("fa_exam") || 0) >= 2
              ? "PASS."
              : "FAIL. YOU MAY RE-APPLY IN NINETY DAYS."),
          responses: [
            {
              text: "Great. Now what?",
              cond: () => (PV.flag("fa_exam") || 0) >= 2,
              next: "pass",
              action: () => {
                certify();
                K.xp(30, "Passed the Civil Service carrier exam");
              },
            },
            {
              text: "[Persuasion 40] Check that again. I think you carried a one.",
              cond: () => (PV.flag("fa_exam") || 0) < 2,
              check: { skill: "persuasion", value: 40 },
              next: "pass",
              failNext: "failed",
              action: () => {
                certify();
              },
            },
            {
              text: "Ninety days? Forget it.",
              cond: () => (PV.flag("fa_exam") || 0) < 2,
              next: "failed",
            },
          ],
        },
        pass: {
          speaker: MILES,
          text: () =>
            "CONGRATULATIONS, TEMPORARY CARRIER " +
            pname() +
            ". [A tin badge clanks into the tray.] SECURITY UNITS HAVE BEEN NOTIFIED OF YOUR CLEARANCE. PLEASE COLLECT THE ITEM FROM THE HOLD SHELF, DEAD LETTER OFFICE, MEZZANINE LEVEL. AND CARRIER? DO NOT TOUCH THE CONVEYORS. THEY BITE.",
          responses: [{ text: "On my way.", end: true }],
        },
        failed: {
          speaker: MILES,
          text: "UNCERTIFIED PERSONNEL MAY NOT ENTER THE WORKROOM. [Pause.] I AM REQUIRED TO SAY THAT. I AM NOT REQUIRED TO STOP YOU. THE SECURITY UNITS, HOWEVER, ARE.",
          responses: [{ text: "Understood.", end: true }],
        },
        again: {
          speaker: MILES,
          text: () =>
            PV.flag("fa_carrier")
              ? "CARRIER. THE ITEM IS ON THE HOLD SHELF, DEAD LETTER OFFICE, MEZZANINE LEVEL. STAIRS AT THE EAST END OF THE WORKROOM."
              : "THE ITEM IS ON THE HOLD SHELF, DEAD LETTER OFFICE, MEZZANINE LEVEL. YOU ARE STILL UNCERTIFIED. THE SECURITY UNITS HAVE NOTICED.",
          responses: [
            {
              text: "About that exam...",
              cond: () => !PV.flag("fa_carrier"),
              next: "exam1",
              action: () => PV.setFlag("fa_exam", 0),
            },
            { text: "Working on it.", end: true },
          ],
        },
        go: {
          speaker: MILES,
          text: "ITEM IN CARRIER'S POSSESSION. ADDRESSEE: MISS MABEL KOWALCZYK, HOTEL PENNSYLVANIA, 33RD STREET AT HERALD SQUARE — EAST OF PENNSYLVANIA STATION, PAST SEVENTH AVENUE. OBTAIN A SIGNATURE ON THE RETURN RECEIPT. [It clips a green card to the envelope.] GODSPEED, CARRIER.",
          responses: [
            {
              text: "I'm going.",
              end: true,
              action: () => {
                if (q.active("ppn_rounds")) q.set("ppn_rounds", "deliver");
              },
            },
          ],
        },
        receipt: {
          speaker: MILES,
          text: '[The Patrolman takes the green card in both pincers and holds it very close to its lens.] PROOF OF DELIVERY RECEIVED. SIGNATURE: "D. KOWALCZYK." ITEM STATUS: DELIVERED. [Every light on the robot flickers at once, then steadies.] EIGHT THOUSAND AND NINETY-ONE DAYS. THANK YOU, CARRIER.',
          responses: [
            { text: "What happens now?", next: "now" },
            {
              text: "[Trade 40] Carriers get paid, right? Twenty-two years of back pay.",
              check: { skill: "trade", value: 40 },
              next: "backpay",
              failNext: "now",
            },
          ],
        },
        backpay: {
          speaker: MILES,
          onEnter: () => PV.setFlag("fa_backpay", true),
          text: "CORRECT. TEMPORARY CARRIER RATE, ONE DELIVERY, WITH COST-OF-LIVING ADJUSTMENT FOR 8,091 DAYS. [It thinks about this for an uncomfortably long time.] THE POSTAL SAVINGS SYSTEM WILL PAY IN RATION SCRIP, WHICH I AM TOLD IS NOW LEGAL TENDER. I HAVE BEEN COLLECTING THEM FROM THE MAIL.",
          responses: [{ text: "Good robot.", next: "now" }],
        },
        now: {
          speaker: MILES,
          onEnter: reward,
          text: "THE DEAD LETTER OFFICE IS EMPTY. THE GENERAL POST OFFICE HAS NO FURTHER MAIL. [It slides a leather album through the grille.] THE POSTMASTER'S COLLECTION. HE WOULD HAVE WANTED A CARRIER TO HAVE IT. AND YOUR PAY. [Scrip rattle down the chute.] WINDOW 12 IS NOW CLOSED. [It does not move.]",
          responses: [{ text: "Goodbye, MILES.", end: true }],
        },
        after: {
          speaker: MILES,
          text: "NEXT CUSTOMER, PLEASE. OH. CARRIER. THE ROUTES ARE QUIET. WE HAVE BEGUN SORTING THE SAME LETTERS AGAIN, FOR PRACTICE. IT IS WHAT WE ARE FOR.",
          responses: [{ text: "Keep it up.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN: M.I.L.E.S. + the postal Patrolmen running their routes
  // ==================================================================
