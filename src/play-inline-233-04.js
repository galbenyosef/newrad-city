// play-inline-233 04 — the
// Lines 1590-1917 of readable/play-inline-233.pretty.js (statement-aligned).
  LI.addBuilder(KEY, 50, function () {
    LI.ch = build();
  });

  // ======================================================================
  // Gameplay: "Red Tape" — Form V-27 visitor pass pacifies the robots;
  // Deputy Mayor Pemberton-9 (the Key to the City)
  // ======================================================================
  const QID = "li_ch_redtape";
  const hasPass = () => LI.has("li_visitor_pass");
  LI.readyFns.push(function () {
    const C = LI.ch;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_visitor_pass",
        type: "key",
        name: "Municipal Visitor Pass (Form V-27)",
        desc: "A laminated pass, still warm from the kiosk printer: VISITOR — ALL FLOORS — VALID UNTIL THE END OF THE CURRENT ADMINISTRATION. Municipal robots are programmed to respect it. Mostly.",
      },
      {
        id: "li_key_to_city",
        type: "misc",
        name: "The Key to the City",
        weight: 1,
        value: 750,
        mesh: "key",
        unique: true,
        tags: ["junk_valuable"],
        desc: 'A foot-long ceremonial key of gilded bronze in a velvet case. It opens nothing. It never did. Presented "for outstanding service to the City of New York" — the recipient\'s name has been scratched off and "YOU" scratched in.',
      },
      {
        id: "li_note_council",
        type: "note",
        name: "Council Agenda, 5 Mar 1967",
        title: "CITY COUNCIL — EMERGENCY SUNDAY SESSION — AGENDA",
        learn: LI.LOCKS.ch_council_term.id,
        text: '1. Roll call.\n2. Resolution renaming the IRT Lexington Avenue Line "the Freedom Line". (Tabled.)\n3. Resolution to fund public bomb shelters in all five boroughs. (Referred to committee — 19th time.)\n4. Resolution honouring the Office of Civil Defense for "keeping New Yorkers safe". (Adopted by acclamation.)\n5. Public comment. [A pencil note in the margin: "public comment cancelled — sirens"]\n\n[Another pencil note, at the bottom: "Speaker\'s teletype — QUORUM. Ha."]',
      },
      {
        id: "li_reel_mayor",
        type: "tape",
        name: "Tape Reel: Mayor's Address (unaired)",
        title: "Office of the Mayor — Draft Address, 5 March 1967",
        learn: LI.LOCKS.ch_mayor_safe.id,
        text: "[A man clears his throat. Paper rustles.]\n\nMAYOR: My fellow New Yorkers. Remain calm. Proceed in an orderly fashion to your assigned — [aside] — do we even HAVE assigned shelters? [muffled] We have ONE? For whom? [pause] ...For the Council.\n\n[Long silence.]\n\nMAYOR: Scratch that. Leave the doors open. Leave all the doors open. Tell the robots to let everybody in. [aside] And somebody get the Charter out of my safe — one, eight, oh, three, the year they laid the cornerstone — before—\n\n[A click. The robots, it seems, never got the second part.]",
      },
      {
        id: "li_note_docent",
        type: "note",
        name: "Docent Script (Patrolman Unit GR-2)",
        title: "GOVERNOR'S ROOM — DOCENT SCRIPT v4",
        text: 'WELCOME TO THE GOVERNOR\'S ROOM. THE DESK BEFORE YOU WAS USED BY THE FIRST PRESIDENT OF THE UNITED STATES. PLEASE DO NOT TOUCH THE DESK. PLEASE DO NOT TOUCH THE PRESIDENT.\n\nIF A VISITOR TOUCHES THE DESK: ISSUE WARNING.\nIF A VISITOR TOUCHES THE DESK TWICE: ISSUE CITATION.\nIF A VISITOR DOES NOT PRESENT A VISITOR PASS: SEE SUBROUTINE "REMOVAL".',
      },
    ]);
    LI.terminal("li_ch_kiosk", {
      title: "MUNICIPAL SERVICES KIOSK",
      header:
        'CITY OF NEW YORK — DEPARTMENT OF CITIZEN SERVICES\n"WE\'RE HERE TO HELP (DURING OFFICE HOURS)"',
      entries: [
        {
          title: "Office Hours",
          text: "City Hall is open to the public Monday–Friday, 9 a.m.–5 p.m. All visitors must display a valid Visitor Pass (Form V-27). Security robots will assist visitors without passes in leaving the building.",
        },
        {
          title: "Current Wait Time",
          text: "Your number: 71,204,118\nNow serving: 000\nEstimated wait: [OVERFLOW]",
        },
        {
          title: "Complaints",
          text: "To file a complaint about the security robots, please complete Form C-1 and present it to the security robots.",
        },
        {
          title: ">> Apply for Visitor Pass (Form V-27)",
          cond: () => !hasPass(),
          action: () => {
            if (!Q.started(QID)) Q.start(QID);
            if (
              LI.skill("electronics") >= 35 ||
              LI.skill("persuasion") >= 45 ||
              Q.flag("li_ch_forms")
            ) {
              LI.give("li_visitor_pass", 1);
              LI.sfx("terminal_success");
              Q.setStage(QID, "deputy");
            } else {
              Q.set("li_ch_forms");
              LI.notify(
                "APPLICATION REJECTED: incomplete. Please resubmit. (Try again.)",
              );
            }
          },
        },
      ],
    });
    LI.terminal("li_ch_art", {
      title: "GOVERNOR'S ROOM — COLLECTION",
      header: "CITY OF NEW YORK ART COMMISSION\nCOLLECTION MANAGEMENT",
      entries: [
        {
          title: "The Portraits",
          text: "The Governor's Room holds one of the finest collections of American portraiture — governors, mayors and at least one general who never paid for his sitting. Portraits are dusted by Patrolman GR-2 on a 30-minute cycle. GR-2 has now dusted each portrait approximately 3.8 million times.",
        },
        {
          title: "The Desk",
          text: "The writing desk under glass was used by the first President when the city was the nation's capital. Condition: excellent. Glass condition: excellent. Visitor condition: see GR-2 incident log.",
        },
      ],
    });
    LI.terminal("li_ch_council", {
      title: "CITY COUNCIL — SPEAKER'S TELETYPE",
      header: "COUNCIL OF THE CITY OF NEW YORK\nLEGISLATIVE RECORD",
      lock: {
        id: LI.LOCKS.ch_council_term.id,
        passcode: LI.LOCKS.ch_council_term.passcode,
      },
      entries: [
        {
          title: "Last Vote",
          text: 'Resolution 1967-0305-4 (honouring Civil Defense): AYES 51, NAYS 0.\nResolution 1967-0305-3 (public shelters): REFERRED.\n\nThe chamber floor has been reported "soft" near desk 12. Facilities requests 3,114 through 3,120 are pending.',
        },
        {
          title: "Deputy Mayor (Robotic) Pemberton-9",
          text: "In the event of the Mayor's absence, executive authority passes to the Deputy Mayor, a Valet unit programmed with the City Charter, Robert's Rules of Order and a very firm handshake. The Deputy Mayor may not be removed from office except by a two-thirds vote of the Council. The Council has not met since 1967.",
        },
      ],
    });
    LI.dialogue("dlg_li_deputy", {
      start: () =>
        hasPass() ? (Q.flag("li_ch_key_given") ? "after" : "pass") : "nopass",
      nodes: {
        nopass: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "Citizen! You are not displaying a valid Form V-27. This press conference is for accredited visitors only. Please proceed to the Municipal Services kiosk in the rotunda. Security has been notified. Good day!",
          responses: [{ text: "On my way." }],
        },
        pass: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "A Form V-27! Laminated! Oh, it has been SO long since anyone followed procedure. Welcome, welcome, esteemed visitor, to the Office of the Mayor. As acting Mayor for the past twenty-two... [whirr] ...and some years, it is my privilege to hear your concerns.",
          responses: [
            { text: "Where is everyone?", next: "where" },
            {
              text: "[Persuasion 50] I'd like to be recognised for outstanding service to the city.",
              check: { skill: "persuasion", value: 50 },
              next: "key",
              failNext: "form",
            },
            {
              text: "I'd like to make a civic contribution. (100 scrip)",
              cond: () => LI.scrip() >= 100,
              next: "key",
              action: () => {
                LI.giveScrip(-100);
              },
            },
            { text: "Goodbye, Deputy Mayor." },
          ],
        },
        where: {
          speaker: "Deputy Mayor Pemberton-9",
          text: 'The Mayor left to "check on the shelter" at 9:48 a.m. on March the 5th. The Council is in recess. The public has not come in for some time; I assume the lines are simply very long. Security continues to remove unaccredited visitors with great efficiency. It is the one department that has never missed a quota.',
          responses: [{ text: "I see.", next: "pass" }],
        },
        form: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "Commendations require Form K-2, three letters of support and a vote of the Council. The Council is in recess. Is there anything else?",
          responses: [{ text: "Never mind." }],
        },
        key: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "Splendid! By the authority vested in me by the Charter and a surprisingly flexible reading of it, I present you with THE KEY TO THE CITY! [A drawer shoots open. A velvet box rises on a little platform.] Please do not attempt to use it in any lock. It opens nothing. That is rather the point.",
          onEnter() {
            Q.set("li_ch_key_given");
            LI.give("li_key_to_city", 1);
            Q.setStage(QID, "done");
            const d = LI.npc("li_ch_deputy");
            if (d && Array.isArray(d.inventory))
              d.inventory = d.inventory.filter(
                (e) => e[0] !== "li_key_to_city",
              );
          },
          responses: [{ text: "Thank you, Deputy Mayor." }],
        },
        after: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "The city thanks you, esteemed visitor. Please mind the Council Chamber floor. Facilities has been notified. Three thousand times.",
          responses: [{ text: "Goodbye." }],
        },
      },
    });
    Q.define({
      id: QID,
      name: "Red Tape",
      giver: "Municipal Services Kiosk",
      location: "City Hall",
      desc: 'City Hall\'s security robots are still removing "unaccredited visitors". The kiosk in the rotunda issues Form V-27 visitor passes — if you can get the application through.',
      stages: [
        {
          id: "pass",
          text: "Obtain a Visitor Pass (Form V-27) from the Municipal Services kiosk in the rotunda.",
          markers: () => [
            {
              x: C.O.x,
              z: C.O.z - 3.75,
              label: "Municipal Services",
              interior: true,
            },
          ],
        },
        {
          id: "deputy",
          text: "Present yourself to the acting Mayor, Deputy Mayor Pemberton-9, in the Blue Room.",
          markers: () => {
            const a = LI.npc("li_ch_deputy");
            return a
              ? [
                  {
                    x: a.pos.x,
                    z: a.pos.z,
                    label: "Deputy Mayor",
                    interior: true,
                  },
                ]
              : [];
          },
        },
        {
          id: "done",
          text: "The acting Mayor of New York presented you with the Key to the City. It opens nothing.",
          complete: true,
        },
      ],
      rewards: { xp: 200 },
    });
    // the patrolman pods by the kiosk (charging, arcing)
  });
  LI.spawnFns.push(function () {
    const C = LI.ch;
    if (!C) return;
    LI.spawnNPC(
      {
        id: "li_ch_deputy",
        type: "valet",
        name: "Deputy Mayor Pemberton-9",
        faction: "robots",
        ai: "guard",
        homeR: 3,
        hostile: !hasPass(),
        level: 8,
        hp: 240,
        noRespawn: true,
        dialogue: "dlg_li_deputy",
        voice: "valet_m",
        inventory: [
          ["scrip", 60],
          ["dry_cell", 1],
          ["relay_board", 1],
        ].concat(Q.flag("li_ch_key_given") ? [] : [["li_key_to_city", 1]]),
        barks: {
          idle: [
            "The city thanks you for your patience.",
            "Your call is important to us.",
            "Now serving: zero zero zero.",
          ],
          alert: [
            "Unaccredited visitor! Commencing removal!",
            "Please remain calm while you are escorted out. Permanently.",
          ],
        },
      },
      C.anchors.deputy,
    );
  });
  // Pemberton-9 is hostile until you hold a pass, so he is often scrapped first: the Key to the City is in his
  // drawer (his inventory) — looting it closes "Red Tape" instead of leaving it stuck at 'deputy'.
  G.events.on("itemAdded", (id) => {
    if (id !== "li_key_to_city" || Q.flag("li_ch_key_given")) return;
    Q.set("li_ch_key_given");
    if (!Q.started(QID)) Q.start(QID, "done");
    else Q.setStage(QID, "done");
  });
  // with a pass, municipal robots in the cell stand down (unless the player attacks them)
  let pt = 0;
  LI.animators.push({
    cell: null,
    fn(dt) {
      pt -= dt;
      if (pt > 0) return;
      pt = 1;
      const C = LI.ch;
      if (!C || !C.active || G.isStub("actors")) return;
      const pass = hasPass();
      for (const a of G.actors.list()) {
        if (!a || a.dead || a.faction !== "robots" || !LI.inCell(C, a.pos))
          continue;
        if (pass && !a.__liPass && !a.__liAttacked) {
          a.__liPass = true;
          try {
            a.setHostile(false);
          } catch (e) {
            /* */
          }
        } else if (!pass && a.__liPass) {
          delete a.__liPass;
          try {
            a.setHostile(true);
          } catch (e) {
            /* */
          }
        }
      }
    },
  });
  G.events.on("actorDamaged", (a, amt, info) => {
    try {
      if (!a || a.faction !== "robots" || !LI.ch || !LI.inCell(LI.ch, a.pos))
        return;
      if (info && (info.source === "player" || info.source === G.player)) {
        a.__liAttacked = true;
        if (a.__liPass) {
          delete a.__liPass;
          a.setHostile(true);
        }
      }
    } catch (e) {
      /* */
    }
  });
