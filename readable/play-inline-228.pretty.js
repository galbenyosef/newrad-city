/* src/landmark_interiors/11_un_content.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 11_un_content.js
 * UN General Assembly — gameplay: Major Adelaide Keel (the Continuity's
 * science liaison; in February 1968 the Relief Station lieutenant who refused
 * Rose Mead penicillin; talks to guests, fights everyone else), the quest
 * "Pure Records" (`li_un_records`, absorbed into main quest mq21: the 1967
 * Civil Defense ENROLMENT MICROFILM that Directive 7-A runs on — give it to
 * Keel / sell it to the Iron Covenant / burn it; flags li_un_tapes_to and
 * ms_microfilm = 'continuity' | 'covenant' | 'burned'), terminals with the
 * Project Knickerbocker lore, the strongroom's electric security grille, the
 * guest truce inside the cell, notes, codes (records terminal, project
 * terminal, the Secretary-General's safe) and unique loot. The 1968 Relief
 * Station ledger and the Keel confrontation are main-story beats placed by
 * src/quests at this cell's `records` / `strongroom` anchors.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
  const LI = G._li,
    Q = LI.q;
  const QID = "li_un_records";

  /** The player is the Continuity's "guest" (same rule as the UN Plaza truce) or has joined them.
   *  (Faction / flag ids below are the shared ids of src/quests.) */
  function guest() {
    if (!Q.live()) return false;
    if (
      Q.flag("con_hostile") ||
      Q.flag("li_keel_hostile") ||
      Q.flag("ending_played")
    )
      return false;
    return Q.active("mq04") || Q.flag("mq_faction") === "continuity";
  }
  LI.unGuest = guest;

  const state = { turretsOff: false };
  LI.saveHooks.un = {
    save: () => ({
      field: LI.unField ? LI.unField.on : true,
      turretsOff: state.turretsOff,
    }),
    load(d) {
      d = d || {};
      if (LI.setUnField) LI.setUnField(d.field !== false);
      state.turretsOff = !!d.turretsOff;
      applyTurrets(true);
    },
    reset() {
      if (LI.setUnField) LI.setUnField(true);
      state.turretsOff = false;
    },
  };

  function applyTurrets(force) {
    if (G.isStub("props") || !G.props.setTurrets) return;
    const want = state.turretsOff ? "off" : guest() ? "friendly" : "hostile";
    if (!force && want === state._turrets) return;
    state._turrets = want;
    try {
      G.props.setTurrets("li_un_sec", want);
    } catch (e) {
      /* */
    }
  }

  // ------------------------------------------------------------------
  // initDone: items, terminals, dialogue, quest, interactables, radiation
  // ------------------------------------------------------------------
  LI.readyFns.push(function () {
    const C = LI.un;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_un_gavel",
        type: "misc",
        name: "Assembly Gavel",
        weight: 1,
        value: 350,
        mesh: "misc",
        tags: ["junk_valuable"],
        desc: "The President of the General Assembly's gavel: carved wood, a gift from a small island nation, cracked down the middle from being used on a 1967 session that would not come to order.",
      },
      {
        id: "li_sg_suit",
        type: "apparel",
        slot: "body",
        name: "Secretary-General's Suit",
        weight: 2,
        value: 420,
        dr: 4,
        attrs: { presence: 2 },
        skills: { persuasion: 10, trade: 5 },
        outfit: "merchant",
        mesh: "cloth_black",
        unique: true,
        tags: ["apparel", "clothing", "old_world", "unique"],
        desc: "A charcoal diplomatic three-piece with a blue lapel pin, kept pressed in a strongroom safe for twenty-two years. Wearing it, people instinctively wait for you to finish your sentence.",
      },
      {
        id: "li_genome_tapes",
        type: "misc",
        name: "Civil Defense Enrolment Microfilm (1967)",
        weight: 3,
        value: 0,
        quest: true,
        noLoot: true,
        desc: "Eleven reels of 16 mm microfilm in a steel case stamped OFFICE OF CIVIL DEFENSE — NATIONAL ENROLMENT — NEW YORK REGION — 1967 — RESTRICTED. Every enrolled name in the city, filmed card by card. Everyone born since the Bombing is missing from it, because nobody enrolled them. Directive 7-A runs off this list.",
      },
      {
        id: "li_un_fieldkey",
        type: "key",
        name: "Major Keel's Pass Key",
        desc: "A navy-and-brass keycard on a lanyard. The magnetic strip reads KEEL, A. — SCIENCE LIAISON — ALL DOORS. It drops the strongroom grille.",
      },
      {
        id: "li_un_pass",
        type: "misc",
        name: "United Nations Laissez-Passer",
        weight: 0,
        value: 40,
        tags: ["junk_valuable"],
        desc: 'A blue travel document with a gold seal: "The Secretary-General requests all whom it may concern to permit the bearer to pass freely." Nobody left to ask.',
      },
      {
        id: "li_reel_last_address",
        type: "tape",
        name: 'Tape Reel: "The Last Address"',
        title: "UN General Assembly — Emergency Session, 5 March 1967",
        text:
          "[A gavel. Murmuring in fourteen languages.]\n\nPRESIDENT: The Assembly will come to order. The Assembly will... thank you. The chair recognizes the delegate from—\n\n" +
          '[A door bangs. Running feet. Someone shouts in French, then in English: "Bombers over the Atlantic. Theirs. Ours are not answering."]\n\n' +
          "PRESIDENT: Please remain in your seats. Please — the interpreters are still — we are still in session. We are STILL IN SESSION.\n\n" +
          "[The murmuring becomes a roar. Somewhere close to the microphone, very quietly, a woman keeps translating everything into Russian, then Spanish, then nothing.]\n\n" +
          "PRESIDENT: ...This session is adjourned.\n\n[The gavel falls once. The recording runs on for eleven minutes of empty room.]",
      },
      {
        id: "li_note_interpreter",
        type: "note",
        name: "Interpreter's Shift Log",
        title: "Booth 3 — Russian — Shift Log",
        text:
          "09:02  Opening statements. Delegate from Canada apologises for the weather in Canada. Delegate from France does not.\n" +
          '09:30  "Ultimatum" translated as "ultimatum" four times. It remains an ultimatum.\n09:41  Session interrupted.\n09:42  Session interrupted.\n' +
          "09:44  I keep translating. Somebody should hear it in their own language.\n09:47  Booth 2 has gone. Booth 4 has gone. I am still here. The Assembly is empty and the microphones are all still on.\n" +
          "09:51  To whoever reads this: everything they said in there, they meant. That was the problem.",
      },
      {
        id: "li_note_keel_orders",
        type: "note",
        name: "Orders: Science Liaison Keel",
        title: "THE CONTINUITY — FORWARD COMMAND — CLASSIFIED",
        learn: LI.LOCKS.un_project_term.id,
        text:
          "TO: Maj. A. Keel, Science Liaison (Project K)\nFROM: Col. A. Crane\n\n1. The 1967 enrolment microfilm in the UN records strongroom is the only complete copy of the New York rolls off the island. SELECTIVE mode (Directive 7-A) cannot be run without it: the Array must be told who is on the rolls.\n" +
          "2. Recover it. Do not let the Iron Covenant's archivists near that strongroom. They read everything.\n3. The sleeper from the Long Winter program is enrolled, is a PRIORITY ASSET, and is a guest until the Colonel says otherwise. Smile.\n4. The isotope cooler in the strongroom is leaking. Do not stand next to it. This is an order, Major, not advice.\n5. Field office terminal word this week: MORNINGSTAR (Sgt. Ortiz picked it; it is also on his blotter, Sergeant). Burn this after reading. (You will not. You never do.)\n\nThe Republic endures.",
      },
    ]);

    LI.terminal("li_un_checkpoint", {
      title: "CONTINUITY CHECKPOINT — GA LOBBY",
      header: "THE CONTINUITY — FIELD TELETYPE\nPROJECT K / FORWARD COMMAND",
      entries: [
        {
          title: "Visitor Log",
          text: "ADMITTED: 0\nDETAINED: 14 (scavengers)\nRELEASED: 0\nCURRENT GUESTS: 1 — Long Winter sleeper (per Lt. Hale: DO NOT ENGAGE. Smile.)",
        },
        {
          title: "Standing Orders",
          text: '1. Nobody enters the Records Strongroom without Major Keel. The grille is electric. Do not touch the grille.\n2. Keep the pendulum running. Morale officer says the men find it "reassuring".\n3. Stop saluting the Sputnik. It is Russian.',
        },
        {
          title: "Maintenance Ticket #1142",
          text: "Dome lighting ring, sector 4: fixture collapsed onto delegate rows 11–14. Repair deferred. Delegates did not complain.",
        },
      ],
    });
    LI.terminal("li_un_visitor", {
      title: "UNITED NATIONS VISITOR CENTRE",
      header:
        "WELCOME TO UNITED NATIONS HEADQUARTERS\nPLEASE WEAR YOUR VISITOR BADGE AT ALL TIMES",
      entries: [
        {
          title: "Guided Tours",
          text: "Guided tours of the General Assembly Hall depart every thirty minutes from this desk.\n\nThe Hall seats one delegation of six for every member state. The golden wall behind the podium is covered in gold leaf. The emblem shows the world as seen from above the North Pole, held in a wreath of olive branches — because nobody could agree which country should be in the middle.\n\nTOURS SUSPENDED UNTIL FURTHER NOTICE.",
        },
        {
          title: "Model UN 1967 (Schools Programme)",
          text: "This year's Model United Nations will simulate the Atlantic Crisis. Participating schools are reminded that the European Coalition is to be played by the visiting team, and that blockading the host school's cafeteria is not a legitimate exercise of Article 51.",
        },
        {
          title: "Foucault Pendulum",
          text: "The pendulum in the lobby swings in a fixed plane while the Earth turns beneath it — completing one full rotation of the floor every 37 hours at this latitude. An electromagnet in the ceiling keeps it moving. It will keep moving for as long as there is power, or an Earth.",
        },
        {
          title: "Gift Shop",
          text: 'The UN Bookshop sells stamps valid for postage only from this building, flags of all member states (subject to availability and recognition), and the popular "WE THE PEOPLES" tote bag.',
        },
        {
          title: "Staff Notice (Records)",
          text: () => {
            LI.learnCode(
              LI.LOCKS.un_records_term.id,
              "UN visitor centre terminal",
            );
            return "RECORDS & ARCHIVES STAFF: the restricted-stacks terminal password has been reset to PEACEKEEPER. Please do not write it on the microfilm reader again.\n\n— Building Management, 2 March 1967";
          },
          learn: LI.LOCKS.un_records_term.id,
        },
      ],
    });
    LI.terminal("li_un_project", {
      title: "PROJECT KNICKERBOCKER — FIELD OFFICE",
      header:
        "THE CONTINUITY — SCIENCE DIRECTORATE\nWARNING: THIS TELETYPE IS MONITORED",
      lock: {
        id: LI.LOCKS.un_project_term.id,
        passcode: LI.LOCKS.un_project_term.passcode,
      },
      entries: [
        {
          title: "Project Summary",
          text: 'The Knickerbocker Atmospheric Reclamation Array (Liberty Island) scrubs radionuclides from the air across the greater metropolitan area.\n\nIn SELECTIVE configuration (Directive 7-A) the field is keyed to the 1967 Civil Defense enrolment rolls: persons on the rolls are spared; persons not on the rolls (the people of the Neon, who burned their census cards, and every child born since 5 March 1967, none of whom was ever enrolled) are "reclaimed": sterilised.\n\nThe Science Directorate notes that "reclaimed" is a word chosen by the Public Relations Directorate.',
        },
        {
          title: "The Rolls Initiative",
          text: 'Directive 7-A needs the list. Liberty holds the index; the film itself (eleven reels, every enrolled name in the New York Region) was deposited in the UN Records Strongroom on the afternoon of 4 March 1967 by the U.S. Civil Defense liaison, "for safekeeping, until further notice".\n\nStatus: STRONGROOM SECURED (grille live). Film: NOT YET RECOVERED. Isotope cooler: LEAKING.\n\nNote (Keel): I have run the list twice. Every child in this city is off it. I signed for a list like this once before, in February 1968, at a folding table in Grand Central. I have not told the Colonel what it cost.',
        },
        {
          title: "Field Office Personnel",
          text: 'MAJ. A. KEEL — Science Liaison (commanding)\nSGT. D. ORTIZ — Communications (still has not locked the drive)\nPVT. several — Security\nSKY-EYE DRONE "PATRIOT" — Morale (broadcasting)',
        },
        {
          title: ">> Drop the Records Strongroom grille",
          cond: () => LI.unField && LI.unField.on,
          action: () => {
            LI.setUnField(false);
            Q.set("li_un_field_off");
            LI.notify(
              "The Records Strongroom grille drops into its floor slot.",
            );
          },
        },
        {
          title: ">> Raise the Records Strongroom grille",
          cond: () => LI.unField && !LI.unField.on,
          action: () => {
            LI.setUnField(true);
            Q.set("li_un_field_off", false);
            LI.notify("The Records Strongroom grille rises and locks.");
          },
        },
        {
          title: ">> Deactivate corridor turrets",
          cond: () => !state.turretsOff,
          action: () => {
            state.turretsOff = true;
            applyTurrets(true);
            LI.notify("Security Council corridor turrets deactivated.");
          },
        },
      ],
    });
    LI.terminal("li_un_records", {
      title: "UNITED NATIONS — RECORDS MANAGEMENT",
      header:
        "UN RECORDS & ARCHIVES — RESTRICTED STACKS\nPLEASE RETURN MICROFILM TO THE DESK",
      lock: {
        id: LI.LOCKS.un_records_term.id,
        passcode: LI.LOCKS.un_records_term.passcode,
      },
      entries: [
        {
          title: "Deposit R-9: U.S. Civil Defense (1967)",
          text: 'Received 4 March 1967, 17:10, from the U.S. Civil Defense liaison to the United Nations (R. Ashby): one steel case, eleven reels of microfilm, NATIONAL ENROLMENT — NEW YORK REGION. "For safekeeping, until further notice."\n\nThe liaison asked whether the strongroom was "deep". He was told it was. He did not come to the morning session.\n\nShelved at desk R-9 in the transport case.',
        },
        {
          title: "Deposit R-10: Relief Station Ledgers (1967–68)",
          text: "Received 6 March 1968 from the Office of Civil Defense, Grand Central Relief Station (closed): the station's daily ledgers, April 1967 to March 1968. Sealed by order. Seal broken: see the desk.",
        },
        {
          title: "Cooler Fault Report",
          text: 'The archive climate unit (isotope-heated, Halvorsen Atomic) is venting. Staff are advised not to linger at the east stacks. Staff are advised that "linger" means "more than four seconds".',
        },
        Object.assign(
          { title: "Memo: The Secretary-General's Suit" },
          LI.codeText(
            "un_sg_safe",
            "The S-G's spare suit is to remain in the strongroom safe for use at short notice (funerals, coronations, surrender ceremonies). The combination is UN Day: 2-4-1-0. The S-G chose it so he would never forget it. The S-G has not been seen since Saturday.",
          ),
        ),
      ],
    });

    // Keel
    LI.dialogue("dlg_li_keel", {
      start: () => {
        if (
          (Q.stage(QID) === "decide" ||
            Q.stage(QID) === "find" ||
            Q.stage(QID) === "enter") &&
          LI.has("li_genome_tapes")
        )
          return "tapes";
        return Q.flag("li_met_keel") ? "again" : "first";
      },
      nodes: {
        first: {
          speaker: "Major Adelaide Keel",
          text: () =>
            "Stop there. ...A Long Winter cryo suit. " +
            LI.hero() +
            ", is it? Hale said you might wander in. Major Adelaide Keel, Science Liaison, Project Knickerbocker. You are standing in the Security Council chamber of a world government that failed. Try not to touch anything; it is all evidence.",
          onEnter() {
            Q.set("li_met_keel");
          },
          responses: [
            { text: "What is the Continuity doing in the UN?", next: "why" },
            { text: "Tell me about Project Knickerbocker.", next: "project" },
            {
              text: "You look like you need something done.",
              next: "job",
              cond: () =>
                !Q.done(QID) &&
                !LI.has("li_genome_tapes") &&
                !(LI.unField && !LI.unField.on && Q.started(QID)),
            },
            { text: "I'll be going." },
          ],
        },
        again: {
          speaker: "Major Adelaide Keel",
          text: () =>
            Q.active(QID)
              ? "The film, citizen. The Records Strongroom is behind the Security Council corridor. Mind the cooler."
              : "Citizen. The Republic thanks you for not shooting anything today.",
          responses: [
            {
              text: "Tell me about Project Knickerbocker again.",
              next: "project",
            },
            {
              text: "I need the field office terminal.",
              next: "word",
              cond: () => guest() && !LI.lockOpen(LI.LOCKS.un_project_term.id),
            },
            {
              text: "You look like you need something done.",
              next: "job",
              cond: () =>
                !Q.done(QID) &&
                !LI.has("li_genome_tapes") &&
                !(LI.unField && !LI.unField.on && Q.started(QID)),
            },
            { text: "Goodbye, Major." },
          ],
        },
        why: {
          speaker: "Major Adelaide Keel",
          text: "Because the old world kept its best records here. Charters, treaties, maps, and on the afternoon before the bombers, a copy of our own enrolment rolls, left here by a man who knew which building would still be standing. When you want to rebuild a nation, citizen, you start with the paperwork of the one that came before.",
          responses: [
            { text: "Tell me about the project.", next: "project" },
            { text: "Goodbye." },
          ],
        },
        project: {
          speaker: "Major Adelaide Keel",
          text: "The array on Liberty Island can clean this sky. Every radionuclide, every storm. That is the part Hale tells you. The other part, the part in my orders, is Directive 7-A. It can be told who is on the list. Everyone who is not on it will have no children.",
          responses: [
            { text: "Who is on the list?", next: "human" },
            {
              text: "[Persuasion 55] You don't sound like you believe in it.",
              check: { skill: "persuasion", value: 55 },
              next: "doubt",
              failNext: "nodoubt",
            },
            { text: "Goodbye." },
          ],
        },
        human: {
          speaker: "Major Adelaide Keel",
          text: "Everyone enrolled with Civil Defense in 1967. You are, sleeper: a federal volunteer, filmed and filed. My soldiers are, mostly; the young ones are not. Every child born since the Bombing is not, because nobody enrolled a child born in a tunnel. The film is in the strongroom. Which is why I am standing in a dead room with a leaking isotope cooler instead of on a rotorcraft home.",
          responses: [
            {
              text: "The film?",
              next: "job",
              cond: () => !Q.done(QID) && !LI.has("li_genome_tapes"),
            },
            { text: "Goodbye." },
          ],
        },
        doubt: {
          speaker: "Major Adelaide Keel",
          text: '[She takes off her helmet. She is older than her voice, and very tired.] I ran the list twice. Every child in this city is off it. My sergeant\'s daughter. The girls who sell water at Grand Central. I followed a list once before, citizen, in the winter of 1968, at a folding table in Grand Central. I said "not enrolled" to a woman with a sick baby. I have followed the list every day since. The Colonel says the list is the list.',
          onEnter() {
            Q.set("li_keel_doubt");
            LI.xp(25, "Persuasion");
          },
          responses: [
            { text: "Then don't give him the list.", next: "refuse" },
            {
              text: "What do you want me to do?",
              next: "job",
              cond: () => !Q.done(QID) && !LI.has("li_genome_tapes"),
            },
            { text: "Goodbye." },
          ],
        },
        nodoubt: {
          speaker: "Major Adelaide Keel",
          text: "I believe in the Republic, citizen. Belief is not a feeling. It is a duty.",
          responses: [{ text: "Goodbye." }],
        },
        word: {
          speaker: "Major Adelaide Keel",
          text: "Read-only, citizen, and I will know if you touch the turrets. The word is MORNINGSTAR. Sergeant Ortiz picked it. Sergeant Ortiz picks all the words.",
          onEnter() {
            LI.learnCode(LI.LOCKS.un_project_term.id, "Major Keel");
          },
          responses: [{ text: "Thank you, Major." }],
        },
        refuse: {
          speaker: "Major Adelaide Keel",
          text: "If the film never reaches Liberty Island, nobody can say Adelaide Keel lost it. Do you understand what I am not asking you to do?",
          responses: [
            { text: "I understand.", action: () => Q.set("li_keel_wink") },
          ],
        },
        job: {
          speaker: "Major Adelaide Keel",
          text: "The 1967 enrolment microfilm. Eleven reels, one steel case, in the Records Strongroom at the end of the backstage corridor. My men will not go in: the isotope cooler has been cooking the east stacks for twenty-two years. You are, forgive me, expendable, curious and enrolled. I will drop the grille.",
          responses: [
            {
              text: "I'll get your film.",
              action: () => {
                if (!Q.started(QID)) Q.start(QID, "find");
                else if (Q.stage(QID) === "enter") Q.setStage(QID, "find");
                LI.setUnField(false);
                Q.set("li_un_field_off");
                LI.notify(
                  "The Records Strongroom grille drops into its floor slot.",
                );
              },
            },
            { text: "Not interested." },
          ],
        },
        tapes: {
          speaker: "Major Adelaide Keel",
          text: () =>
            "You have it. [Her hand hovers over the case.]" +
            (Q.flag("li_keel_doubt")
              ? " ...You know what it is for. I told you. Choose carefully, citizen. I will not be the one who does."
              : " Hand it over. The Republic pays its debts."),
          responses: [
            {
              text: "Here. Take it.",
              standing: -40,
              action: () => {
                LI.take("li_genome_tapes", 1);
                LI.giveScrip(250);
                LI.give("continuity_officer_cap", 1);
                microfilm("continuity");
              },
            },
            {
              text: "[Persuasion 60] The film is fogged. The cooler ruined it.",
              check: { skill: "persuasion", value: 60 },
              next: "lied",
              failNext: "caught",
            },
            { text: "I'll hold on to it for now." },
          ],
        },
        lied: {
          speaker: "Major Adelaide Keel",
          text: () =>
            Q.flag("li_keel_doubt")
              ? "[A long look.] Fogged. What a pity. I will put that in my report, in exactly those words. Dispose of it, citizen. Dismissed."
              : "Fogged. ...Twenty-two years, and it is the cooler that finishes the job. Fine. Dispose of it. Dismissed.",
          onEnter() {
            Q.set("li_keel_lied");
            LI.xp(40, "Persuasion");
          },
          responses: [{ text: "Goodbye, Major." }],
        },
        caught: {
          speaker: "Major Adelaide Keel",
          text: "Fogged. In a lead-lined case. Do not insult me, citizen. Put it on the table or leave my chamber.",
          responses: [
            {
              text: "Fine. Take it.",
              standing: -40,
              action: () => {
                LI.take("li_genome_tapes", 1);
                LI.giveScrip(150);
                microfilm("continuity");
              },
            },
            { text: "[Leave.]" },
          ],
        },
      },
    });

    // Quest (absorbed into main quest mq21; src/quests starts it as a proxy stage at any time — 'enter' skips itself
    // once the grille is down, 'find' once the film is in the pack)
    const grilleDown = () => !!(LI.unField && !LI.unField.on);
    Q.define({
      id: QID,
      name: "Pure Records",
      giver: "Major Adelaide Keel",
      location: "UN General Assembly Hall",
      desc: "Directive 7-A cannot run without its list: the 1967 Civil Defense enrolment microfilm, eleven reels deposited in the UN Records Strongroom the afternoon before the Bombing. Everyone born since 1967 is missing from it. The film sits behind an electric grille and a leaking isotope cooler, and the Continuity wants it on Liberty Island.",
      stages: [
        {
          id: "enter",
          text: "Get into the UN Records Strongroom: Major Keel's pass key, or the field-office teletype in the Security Council (the word is on Keel's orders and Sergeant Ortiz's blotter).",
          markers: () => {
            const out = [];
            const k = LI.npc("li_keel");
            if (k && !k.dead && !LI.has("li_un_fieldkey"))
              out.push({
                x: k.pos.x,
                z: k.pos.z,
                label: "Major Keel",
                interior: true,
              });
            const sc = LI.un.anchors.security_council;
            if (sc)
              out.push({
                x: sc.x,
                z: sc.z,
                label: "Project Teletype",
                interior: true,
              });
            return out;
          },
        },
        {
          id: "find",
          text: "Recover the 1967 enrolment microfilm from the UN Records Strongroom.",
          markers: () => [
            {
              x: LI.un.anchors.tapes.x,
              z: LI.un.anchors.tapes.z,
              label: "Enrolment Microfilm",
              interior: true,
            },
          ],
        },
        {
          id: "decide",
          text: "Decide the microfilm's fate: give it to Major Keel, sell it to the Iron Covenant's archivist at 30 Rockefeller Plaza, or burn it in the strongroom incinerator.",
          markers: () => {
            const out = [];
            const k = LI.npc("li_keel");
            if (k && !k.dead)
              out.push({
                x: k.pos.x,
                z: k.pos.z,
                label: "Major Keel",
                interior: true,
              });
            const m = LI.npc("li_cov_marsh");
            if (m && !m.dead)
              out.push({
                x: m.pos.x,
                z: m.pos.z,
                label: "Archivist Pryor",
                interior: true,
              });
            if (LI.un.anchors.incinerator)
              out.push({
                x: LI.un.anchors.incinerator.x,
                z: LI.un.anchors.incinerator.z,
                label: "Incinerator",
                interior: true,
              });
            return out;
          },
        },
        {
          id: "done_continuity",
          text: "You gave the enrolment microfilm to the Continuity. On Liberty Island, Directive 7-A has its list.",
          complete: true,
        },
        {
          id: "done_covenant",
          text: "You sold the enrolment microfilm to the Iron Covenant. It will be read, catalogued, and never used. Probably. Directive 7-A has no list.",
          complete: true,
        },
        {
          id: "done_burn",
          text: "You burned the enrolment microfilm. Eleven reels of names went up in blue smoke, and Directive 7-A's list with them.",
          complete: true,
        },
      ],
      rewards: { xp: 250 },
    });
    /** The microfilm's fate: flags (outline + main-story names) and the quest's end. */
    function microfilm(to) {
      Q.set("li_un_tapes_to", to);
      Q.set("ms_microfilm", to);
      if (!Q.started(QID)) Q.start(QID, "decide");
      Q.setStage(
        QID,
        to === "continuity"
          ? "done_continuity"
          : to === "covenant"
            ? "done_covenant"
            : "done_burn",
      );
    }
    LI.unMicrofilm = microfilm;

    // Incinerator (records strongroom) — burn the tapes
    const inc = C.W(51.2, 0.9, 7.2);
    C.anchors.incinerator = inc.clone();
    LI.interact(
      inc,
      "Records Incinerator",
      "Use",
      () => {
        if (!LI.has("li_genome_tapes")) {
          LI.notify(
            "An oil-fired records incinerator. The pilot light still flickers.",
          );
          return;
        }
        LI.take("li_genome_tapes", 1);
        LI.sfx("fire_loop", { pos: inc, volume: 0.6 });
        try {
          G.fx.fire(inc, 0.6);
        } catch (e) {
          /* */
        }
        LI.standing(30, "Burned the enrolment microfilm");
        microfilm("burned");
        LI.notify(
          "The film curls, blisters and burns blue. Eleven reels of names. Directive 7-A has no list now.",
        );
      },
      { enabled: () => true },
    );
    // Grille control box (key alternative to the terminal)
    const fe = C.W(49.7, 1.2, 17.8);
    LI.interact(
      fe,
      "Records Strongroom Grille",
      () => (LI.unField && LI.unField.on ? "Drop" : "Raise"),
      () => {
        if (!LI.unField) return;
        if (!LI.unField.on) {
          LI.setUnField(true);
          return;
        }
        if (LI.has("li_un_fieldkey")) {
          LI.setUnField(false);
          Q.set("li_un_field_off");
          LI.notify(
            "You swipe Keel's pass key. The grille drops into its floor slot with a clang.",
          );
        } else
          LI.notify(
            "The control box wants an officer's pass key, or an order from the Project teletype in the Security Council.",
          );
      },
    );
    // the grille dropped by any means moves 'enter' on
    let enterT = 0;
    LI.animators.push({
      cell: null,
      fn(dt) {
        enterT -= dt || 0;
        if (enterT > 0) return;
        enterT = 0.5;
        const st = Q.stage(QID);
        if (st === "enter" && grilleDown()) Q.setStage(QID, "find");
        if ((st === "enter" || st === "find") && LI.has("li_genome_tapes"))
          Q.setStage(QID, "decide");
      },
    });
    // radiation from the leaking cooler
    if (C.radSource) {
      try {
        G.world.addRadSource({
          x: C.O.x + C.radSource.x,
          y: C.radSource.y,
          z: C.O.z + C.radSource.z,
          radius: C.radSource.radius,
          strength: C.radSource.strength,
        });
      } catch (e) {
        /* */
      }
    }
    // picking up the tapes starts / advances the quest
    G.events.on("itemAdded", (id) => {
      if (id !== "li_genome_tapes") return;
      if (!Q.started(QID)) Q.start(QID, "decide");
      else if (Q.stage(QID) === "find" || Q.stage(QID) === "enter")
        Q.setStage(QID, "decide");
    });
    C.pickup(
      "li_genome_tapes",
      1,
      C.anchors.tapes.x - C.O.x,
      C.anchors.tapes.y,
      C.anchors.tapes.z - C.O.z,
      0.4,
    );
  });

  // ------------------------------------------------------------------
  // NPCs (newGame / loaded)
  // ------------------------------------------------------------------
  LI.spawnFns.push(function () {
    const C = LI.un;
    if (!C) return;
    const g = guest();
    LI.spawnNPC(
      {
        id: "li_keel",
        type: "human",
        name: "Major Adelaide Keel",
        outfit: "continuity_exo_rig",
        gender: "f",
        faction: "continuity",
        ai: "guard",
        homeR: 3,
        hostile: !g,
        level: 14,
        hp: 330,
        weapon: "gyrojet_carbine",
        dialogue: "dlg_li_keel",
        voice: "continuity",
        inventory: [
          ["li_un_fieldkey", 1],
          ["scrip", 140],
          ["ammo_gyrojet", 18],
          ["rally_tonic", 2],
        ],
        barks: {
          idle: [
            "Calibration. Everything is calibration.",
            "Do not touch the horseshoe table.",
            "The Republic endures.",
          ],
          alert: [
            "Intruder in the Council chamber!",
            "You were a guest, citizen. Were.",
          ],
        },
        onDeath: () => {
          Q.set("li_keel_dead");
        },
      },
      C.anchors.officer,
    );
    // the lobby checkpoint turrets follow the guest rule too (hostile unless guest)
    state._turrets = null;
    applyTurrets(true);
  });

  // ------------------------------------------------------------------
  // Guest truce inside the cell (mirrors the UN Plaza rule for our garrison)
  // ------------------------------------------------------------------
  let tt = 0;
  LI.animators.push({
    cell: null,
    fn(dt) {
      tt -= dt;
      if (tt > 0) return;
      tt = 1;
      const C = LI.un;
      if (!C || !C.active || G.isStub("actors")) return;
      const g = guest();
      applyTurrets(false);
      for (const a of G.actors.list()) {
        if (!a || a.dead || a.faction !== "continuity" || !LI.inCell(C, a.pos))
          continue;
        if (g && !a.__liTruce && !(a.wasFriendly && a.hostOverride === true)) {
          a.__liTruce = true;
          try {
            a.setHostile(false);
          } catch (e) {
            /* */
          }
        } else if (!g && a.__liTruce) {
          delete a.__liTruce;
          try {
            a.setHostile(true);
          } catch (e) {
            /* */
          }
        }
      }
    },
  });
  // shooting at the garrison while a guest ends the courtesy (Keel remembers)
  G.events.on("actorDamaged", (a, amt, info) => {
    try {
      const C = LI.un;
      if (!C || !a || a.faction !== "continuity" || !LI.inCell(C, a.pos))
        return;
      if (
        info &&
        (info.source === "player" || info.source === G.player) &&
        guest()
      )
        Q.set("li_keel_hostile");
    } catch (e) {
      /* */
    }
  });
})();
