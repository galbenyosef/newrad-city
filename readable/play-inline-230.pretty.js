/* src/landmark_interiors/21_rock_content.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 21_rock_content.js
 * Rockefeller Center (the Iron Covenant's only Manhattan base) — gameplay.
 * Ranks (canon): the Warden (absent, at the mountain Hold out west; never
 * comes) → Lancer-Commander Stroud (Rockefeller only) → Lancers →
 * Archivists / Acolytes. New Covenant NPCs (none of them duplicate the
 * quests module's Stroud / Wexler / Reyes on the plaza):
 *   Archivist Ottoline Pryor        (Studio 8H library; books merchant;
 *                                    buys the UN enrolment microfilm)
 *   Lancer Imre Dalca               (tactical officer; the war room; quest
 *                                    "Eyes on the Island" = the Covenant
 *                                    variant of main quest mq19; gives the
 *                                    war-room passcode)
 *   Lancer Ada Ferro                (exo-rig bays; arms & repair merchant)
 *   Acolyte Quill                   (Rainbow Room mess; food merchant)
 *   Lancers Hargrove & Oyelaran     (lobby checkpoint)
 * Terminals: the Archivists' library and the war-room recall orders
 * (passcode LONGWATCH — Dalca, or the recall tape reel's case).
 * Faction / item / skill ids in literals are shared ids owned by other
 * modules.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
  const LI = G._li,
    Q = LI.q;
  const QID = "li_rock_scope";

  LI.readyFns.push(function () {
    const C = LI.rock;
    if (!C) return;
    const WAR = LI.LOCKS.rock_war_term;
    LI.defineItems([
      {
        id: "li_reel_recall",
        type: "tape",
        name: "Tape Reel: Recall Order No. 5",
        title: "IRON COVENANT — THE WARDEN, AT THE HOLD — RECALL ORDER No. 5",
        learn: WAR.id,
        text:
          '[A dry, elderly voice over a bad relay.]\n\nLancer-Commander Stroud. This is the Warden. This is the fifth recall. I note your previous four replies, each of which consisted of the word "No", and one of which was misspelled.\n\n' +
          "You will bring your column home to the Hold with every piece of recovered technology. You will leave Manhattan to its scavengers and its machines. You were sent down from the mountain to recover, not to stay. I had a chair set at Rockefeller so that I might come and sit in it and bring you home myself.\n\n" +
          '[Pause.] I am told no one has sat in the chair. I am told you had an archivist fold a flag on it.\n\nThat is not an answer, Lancer-Commander.\n\n[End of message. Scrawled on the case in grease pencil: "IT IS AN ANSWER — H.S."  Chalked underneath, in a neater hand: "war room teletype: LONGWATCH — Dalca"]',
      },
      {
        id: "li_note_archive_ledger",
        type: "note",
        name: "Studio 8H Accession Ledger",
        title: "Rockefeller Hold — Accessions (Studio 8H)",
        text:
          '#2211 "Practical Atomic Engineering, Vol. I" — shelved. Vol. II still at the Public Library (Maniacs in the stacks). Wexler volunteered. Denied.\n' +
          '#2212 Television camera, studio grade — shelved (it is too heavy to shelve; it is on the floor).\n#2213 Script, 4 Mar 1967 broadcast (the last Saturday), "cold open" — shelved under HUMOUR, then moved to HISTORY.\n' +
          '#2214 Recipe cards, Rainbow Room kitchen, 1934–1967 — given to Acolyte Quill, against my advice.\n#2215 Seventeen tape reels of "morning programme" — shelved under WARNING.',
      },
      {
        id: "li_covenant_tag",
        type: "misc",
        name: "Covenant Tag (Acolyte Vasquez)",
        weight: 0,
        value: 5,
        mesh: "tag",
        tags: ["dog_tag"],
        desc: "A stamped iron tag on a chain: ACOLYTE R. VASQUEZ — ROCKEFELLER COLUMN. Found by the dead elevator bank in the lobby, where nobody looks.",
      },
    ]);
    LI.terminal("li_rock_archive", {
      title: "STUDIO 8H — ARCHIVISTS' LIBRARY",
      header:
        "IRON COVENANT — ROCKEFELLER COLUMN\nLIBRARY TELETYPE (READ ONLY)",
      entries: [
        {
          title: "On the Rule",
          text: "The Rule is not a book. It is the agreement that we will keep the old world's knowledge out of the old world's hands. Every archivist in this studio was taught that. Some of them even believe it.",
        },
        {
          title: "Studio 8H (history)",
          text: "Built in the 1930s as the largest radio studio in the world, later converted for television. On the night of 4 March 1967 a live comedy programme was broadcast from this floor. The audience laughed at a sketch about the end of the world.\n\nThe risers they sat on now hold six thousand volumes.",
        },
        {
          title: "Priority Acquisitions",
          text: '1. Practical Atomic Engineering (NYPL) — see Archivist Wexler.\n2. Any Halvorsen Atomic schematics mentioning "Knickerbocker".\n3. The 1967 Civil Defense enrolment microfilm (UN Records Strongroom). The Continuity\'s Directive 7-A cannot run without its list. That is reason enough for us to want it more.',
        },
        {
          title: "Rainbow Room (history)",
          text: "Opened 1934 on the 65th floor. The dance floor was built to revolve. The motor still turns if you ask it nicely and wire it to a dry cell. Acolyte Quill has been asked not to.",
        },
      ],
    });
    LI.terminal("li_rock_war", {
      title: "WAR ROOM — ROCKEFELLER CENTER",
      header:
        "IRON COVENANT — OPERATIONS TELETYPE\nAUTHORIZED: LANCER-COMMANDER STROUD / LANCER DALCA (TACTICAL)",
      lock: { id: WAR.id, passcode: WAR.passcode },
      entries: [
        {
          title: "Theatre Summary",
          text: 'CONTINUITY: forward command at UN Plaza, main force on Liberty Island. Rotorcraft count unconfirmed — the long-range scope on the roof has been out of calibration since the last lightning storm.\nBRUTES: Empire State Building. Leadership: "KONG". Do not engage the leadership.\nRAIDERS: Wall Street ("The Exchange"), Brooklyn Bridge, Woolworth Building.',
        },
        {
          title: "The Warden's Chair",
          text: "The Warden had a chair set in this room, to sit in when he comes down from the mountain Hold to relieve the Lancer-Commander and take the column home.\n\nHe has not come in seven years. The Lancer-Commander has ordered the chair dusted daily.",
        },
        {
          title: "Sun Cult (intelligence)",
          text: 'The sun cult is buying European ordnance manuals and rig batteries, and paying in candles and old-world silver. Glowkeeper acolytes seen at the 42nd St tunnels and around Grand Central after dark. Purpose unknown.\n\nLancer-Commander\'s note: "Find out what a church wants with an ordnance manual."',
        },
        {
          title: "Casualty List (Acolytes)",
          text: "VASQUEZ, R. — missing, lobby, during the Maniac breach. Tag not recovered.\nOKORO, T. — Brooklyn Bridge toll. Recovered.\nLINDQVIST, M. — do not ask Lancer Ferro about Lindqvist.",
        },
      ],
    });

    // ---------- dialogue ----------
    LI.dialogue("dlg_li_marsh", {
      start: () =>
        LI.has("li_genome_tapes") && Q.active("li_un_records")
          ? "tapes"
          : Q.flag("li_met_marsh")
            ? "again"
            : "first",
      nodes: {
        first: {
          speaker: "Archivist Ottoline Pryor",
          text: "Shh. [She doesn't look up.] This is Studio 8H, the Archivists' library of the Rockefeller column. Before the bombs they broadcast comedy from this floor. Now we keep the things that stopped being funny. What do you want?",
          onEnter() {
            Q.set("li_met_marsh");
          },
          responses: [
            { text: "What does the Covenant keep here?", next: "keep" },
            { text: "Do you trade?", next: "trade" },
            { text: "I'll let you work." },
          ],
        },
        again: {
          speaker: "Archivist Ottoline Pryor",
          text: "Back again. Keep your voice down and your hands off the television camera.",
          responses: [
            { text: "What does the Covenant keep here?", next: "keep" },
            { text: "Let's trade.", barter: true },
            { text: "Tell me about the Warden's chair.", next: "chair" },
            { text: "Goodbye." },
          ],
        },
        keep: {
          speaker: "Archivist Ottoline Pryor",
          text: "Manuals. Schematics. Poetry, occasionally, when nobody is watching. Everything the old world wrote down about how to end itself — so that nobody reads it who shouldn't. Wexler thinks we should read it to everyone. Wexler is young.",
          responses: [
            { text: "And the Continuity?", next: "gov" },
            { text: "Let's trade.", barter: true },
            { text: "Goodbye." },
          ],
        },
        gov: {
          speaker: "Archivist Ottoline Pryor",
          text: () =>
            "The Continuity are in the UN, rifling through the paperwork of a world government. I would give a great deal to know which paper they are looking for. [She finally looks up.] A great deal, " +
            LI.hero() +
            ".",
          responses: [{ text: "I'll keep my eyes open." }],
        },
        chair: {
          speaker: "Archivist Ottoline Pryor",
          text: "The Warden sent the chair. The Warden did not come to sit in it. Lancer-Commander Stroud had me fold a flag on the seat. It is the most eloquent thing I have ever seen a soldier do.",
          responses: [{ text: "Goodbye." }],
        },
        trade: {
          speaker: "Archivist Ottoline Pryor",
          text: "Duplicates only. Knowledge is not for sale; spare copies of it are.",
          responses: [
            { text: "Show me.", barter: true },
            { text: "Never mind." },
          ],
        },
        tapes: {
          speaker: "Archivist Ottoline Pryor",
          text: '[She stands up so fast her chair falls over.] Is that — the 1967 enrolment microfilm. From the UN strongroom. The Continuity\'s list. Do you understand what you are holding? Without it, Directive 7-A has nobody to spare and nobody to choose: their "selective" setting is a switch with nothing on the other end. Give it to the Rule. It will never be read by anyone who would use it.',
          responses: [
            {
              text: "It's yours. Keep it safe.",
              standing: 15,
              action: () => {
                LI.take("li_genome_tapes", 1);
                LI.giveScrip(300);
                LI.give("book_popular_circuits", 1);
                LI.unMicrofilm && LI.unMicrofilm("covenant");
              },
            },
            {
              text: "[Trade 50] Three hundred isn't enough for the end of a list like that.",
              check: { skill: "trade", value: 50 },
              next: "haggle",
              failNext: "nohaggle",
            },
            { text: "I'm not ready to part with it." },
          ],
        },
        haggle: {
          speaker: "Archivist Ottoline Pryor",
          text: "[A thin smile.] No. It is not. Four hundred and fifty, the book, and my personal thanks, which are rarer than scrip.",
          responses: [
            {
              text: "Deal.",
              standing: 10,
              action: () => {
                LI.take("li_genome_tapes", 1);
                LI.giveScrip(450);
                LI.give("book_popular_circuits", 1);
                LI.unMicrofilm && LI.unMicrofilm("covenant");
              },
            },
          ],
        },
        nohaggle: {
          speaker: "Archivist Ottoline Pryor",
          text: "The Rule does not haggle, sleeper. Three hundred and a book.",
          responses: [
            {
              text: "Fine.",
              standing: 10,
              action: () => {
                LI.take("li_genome_tapes", 1);
                LI.giveScrip(300);
                LI.give("book_popular_circuits", 1);
                LI.unMicrofilm && LI.unMicrofilm("covenant");
              },
            },
            { text: "Not today." },
          ],
        },
      },
    });
    LI.dialogue("dlg_li_dalca", {
      start: () =>
        Q.stage(QID) === "report"
          ? "report"
          : Q.flag("li_met_dalca")
            ? "again"
            : "first",
      nodes: {
        first: {
          speaker: "Lancer Imre Dalca",
          text: "At ease. You're in the war room, which is a grand name for a network boardroom with a map on the table. Lancer Dalca, tactical officer. The Lancer-Commander is on the plaza; I do the part of his job that involves sitting down.",
          onEnter() {
            Q.set("li_met_dalca");
          },
          responses: [
            {
              text: "Whose chair is that at the head of the table?",
              next: "chair",
            },
            {
              text: "Anything I can help with?",
              next: "job",
              cond: () => !Q.started(QID),
            },
            { text: "May I read the war-room teletype?", next: "word" },
            { text: "Carry on." },
          ],
        },
        again: {
          speaker: "Lancer Imre Dalca",
          text: () =>
            Q.active(QID)
              ? "The scope is on the Top of the Rock — express elevator to the Rainbow Room, then up. Watch the sky."
              : LI.hero() + ". Sleeper.",
          responses: [
            { text: "Whose chair is that?", next: "chair" },
            {
              text: "Anything I can help with?",
              next: "job",
              cond: () => !Q.started(QID),
            },
            { text: "May I read the war-room teletype?", next: "word" },
            { text: "Goodbye." },
          ],
        },
        word: {
          speaker: "Lancer Imre Dalca",
          text: "Read it, don't type on it. The word is LONGWATCH. If anybody asks, you guessed.",
          onEnter() {
            LI.learnCode(LI.LOCKS.rock_war_term.id, "Lancer Dalca");
          },
          responses: [{ text: "Thanks, Lancer." }],
        },
        chair: {
          speaker: "Lancer Imre Dalca",
          text: "The Warden's. He sends recall orders from the mountain Hold and a chair to sit in when he comes to take us home. He has never come. Stroud says a Warden who sits in that chair will have to explain to four hundred people why they are leaving a city full of people behind. So far, nobody has volunteered to explain.",
          responses: [
            {
              text: "Anything I can help with?",
              next: "job",
              cond: () => !Q.started(QID),
            },
            { text: "Goodbye." },
          ],
        },
        job: {
          speaker: "Lancer Imre Dalca",
          text: "There's a long-range scope on the observation deck — the Top of the Rock. It's the only thing in Manhattan with a clear line to Liberty Island, and a lightning strike knocked it out of true. My archivists can't climb, my Lancers are on the barricades. Recalibrate it, then watch the island after midnight, when they move things. Tell me what the Continuity has on that island, and the Covenant will remember.",
          responses: [
            { text: "I'll go up.", action: () => Q.start(QID) },
            { text: "Not now." },
          ],
        },
        report: {
          speaker: "Lancer Imre Dalca",
          text: "Well? What did you see?",
          responses: [
            {
              text: "One rotorcraft, still grounded. Crates going into the pedestal. Searchlights on the torch. And a skiff at the pier at two in the morning.",
              next: "thanks",
            },
            {
              text: "[Senses 7] Two squads rotating every four hours — the east dock is blind at the change.",
              check: { attr: "senses", value: 7 },
              next: "thanks2",
              failNext: "thanks",
            },
          ],
        },
        thanks: {
          speaker: "Lancer Imre Dalca",
          text: "Grounded still. Good. [He moves a brass pin on the map.] That's worth something. Take this — and take the gratitude of the Rockefeller column, which is worth rather less but is sincerely meant.",
          onEnter() {
            Q.complete(QID);
            LI.give("ammo_gyrojet", 24);
            LI.giveScrip(100);
          },
          responses: [{ text: "Iron keeps." }],
        },
        thanks2: {
          speaker: "Lancer Imre Dalca",
          text: "A blind spot at the change. [He stares at you, then at the map, then at you.] You should be wearing our colours. Take these; you've earned the good ones.",
          onEnter() {
            Q.set("li_rock_blindspot");
            Q.complete(QID);
            LI.give("ammo_gyrojet", 40);
            LI.giveScrip(150);
            LI.xp(50, "Senses");
          },
          responses: [{ text: "Iron keeps." }],
        },
      },
    });
    LI.dialogue("dlg_li_ferro", {
      start: () => "first",
      nodes: {
        first: {
          speaker: "Lancer Ada Ferro",
          text: () =>
            Q.flag("li_met_ferro")
              ? "Mind the gantries. What do you need?"
              : "Hands where I can see them near the rigs. Lancer Ferro — I keep the Mk Is walking and the armory stocked. If it shoots or it clanks, it's mine.",
          onEnter() {
            Q.set("li_met_ferro");
          },
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Why is one of the rigs rusted?", next: "rust" },
            { text: "Goodbye." },
          ],
        },
        rust: {
          speaker: "Lancer Ada Ferro",
          text: "That was Lindqvist's. She walked it into the East River after a Continuity Sky-Eye drone and walked back out six hours later with the drone. The rig never forgave her. Neither did I. I'm keeping it as a reminder that nobody is allowed to do that again.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Goodbye." },
          ],
        },
      },
    });
    LI.dialogue("dlg_li_pell", {
      start: () => "first",
      nodes: {
        first: {
          speaker: "Acolyte Quill",
          text: "Welcome to the Rainbow Room! Best view in the city, worst food in the Covenant. That's not me being modest, that's the tactical officer's written complaint. Hungry?",
          responses: [
            { text: "What's on the menu?", barter: true },
            { text: "Does the dance floor still turn?", next: "floor" },
            { text: "Goodbye." },
          ],
        },
        floor: {
          speaker: "Acolyte Quill",
          text: "It would if somebody wired a dry cell to the motor, which I have been told not to do, in writing, by Archivist Pryor, twice. [He looks at the floor longingly.] Twice.",
          responses: [{ text: "Goodbye." }],
        },
      },
    });

    // ---------- quest: Eyes on the Island ----------
    // The Covenant variant of main quest mq19 (src/quests runs it as a proxy stage): calibrate the scope, keep watch on
    // Liberty after midnight (the 02:00 skiff: a Glowkeeper boat meeting a Continuity private at the pier — flag
    // ms_teague_seen), report to Dalca. Every stage is order-free and Q.start works at any time.
    const scopeMarker = () =>
      LI.rockWorld
        ? [
            {
              x: LI.rockWorld.anchors.scope.x,
              z: LI.rockWorld.anchors.scope.z,
              label: "Long-Range Scope",
            },
          ]
        : [];
    Q.define({
      id: QID,
      name: "Eyes on the Island",
      giver: "Lancer Imre Dalca",
      location: "30 Rockefeller Plaza",
      desc: "The Iron Covenant's long-range scope on the Top of the Rock was knocked out of true by a lightning strike. Before anybody crosses the harbour, Dalca needs somebody to count the guns on Liberty Island, after midnight, when the Continuity moves things.",
      stages: [
        {
          id: "climb",
          text: "Recalibrate the long-range scope on the Top of the Rock (express elevator to the Rainbow Room, then up).",
          markers: scopeMarker,
          onEnter: () => spawnRoofDrone(),
        },
        {
          id: "watch",
          text: "Keep watch on Liberty Island through the scope after midnight.",
          markers: scopeMarker,
        },
        {
          id: "report",
          text: "Report what you saw on Liberty Island to Lancer Dalca in the war room.",
          markers: () => {
            const a = LI.npc("li_cov_dalca");
            return a
              ? [
                  {
                    x: a.pos.x,
                    z: a.pos.z,
                    label: "Lancer Dalca",
                    interior: true,
                  },
                ]
              : [];
          },
        },
      ],
      rewards: { xp: 150 },
    });
    const W = LI.rockWorld;
    const afterMidnight = () => {
      const h = G.time ? G.time.hour : 2;
      return h >= 1.5 && h < 4.5;
    };
    /** The 02:00 watch: the skiff at the pier. Waits the clock to 02:00 if it is not that late yet. */
    function watchNight() {
      if (!afterMidnight()) {
        try {
          if (!G.isStub("atmos") && G.atmos.setHour)
            G.atmos.setHour(2, { advanceDay: true });
          else if (G.time) {
            G.time.hour = 2;
            G.time.day = (G.time.day || 1) + 1;
          }
        } catch (e) {
          /* */
        }
        LI.notify(
          "You settle in behind the eyepiece and wait. The city goes dark block by block. Two in the morning.",
        );
      }
      LI.notify(
        "02:00. A skiff with no lights noses into Liberty's pier. A robed figure with a shuttered lantern hands something up to a Continuity private, who looks over his shoulder twice. On the skiff's bow, painted small, a sun with twelve rays.",
      );
      Q.set("ms_teague_seen");
      Q.set("li_rock_skiff_seen");
      if (Q.stage(QID) === "watch") Q.setStage(QID, "report");
      LI.xp(30, "Night watch");
    }
    if (W) {
      LI.interact(
        W.anchors.scope.clone().setY(W.anchors.scope.y + 1.3),
        "Long-Range Scope",
        () =>
          Q.stage(QID) === "climb"
            ? "Calibrate"
            : Q.stage(QID) === "watch"
              ? afterMidnight()
                ? "Watch the Island"
                : "Keep Watch Until 02:00"
              : "Look",
        () => {
          const st = Q.stage(QID);
          if (st === "watch") {
            watchNight();
            return;
          }
          if (st !== "climb") {
            LI.notify(
              Q.done(QID)
                ? "Liberty Island, small and grey in the haze. A searchlight sweeps the torch."
                : "The scope's image is a smear of yellow haze. It needs recalibrating.",
            );
            return;
          }
          const sci = LI.skill("electronics");
          if (sci >= 35)
            LI.notify(
              "You realign the prisms by the numbers. Liberty Island snaps into focus.",
            );
          else
            LI.notify(
              "You fumble the prism screws for a long minute before Liberty Island swims into focus.",
            );
          LI.sfx("ui_select");
          LI.notify(
            "Liberty Island: one rotorcraft on the pad, rotor housing open. A crane lowering crates into the pedestal. Searchlights on the torch. Dalca wants the night as well.",
          );
          LI.xp(sci >= 35 ? 40 : 20, "Scope calibrated");
          if (Q.flag("ms_teague_seen")) Q.setStage(QID, "report");
          else Q.setStage(QID, "watch");
        },
      );
    }
  });

  /** A Continuity Sky-Eye drone patrols the roof while the scope is being calibrated. */
  function spawnRoofDrone() {
    const W = LI.rockWorld;
    if (!W || Q.flag("li_rock_drone_done")) return;
    const a = LI.spawnNPC(
      {
        id: "li_rock_skyeye",
        type: "sky_eye",
        name: "Continuity Sky-Eye Drone",
        faction: "continuity",
        hostile: true,
        level: 6,
        ai: "guard",
        homeR: 6,
        noRespawn: true,
        onDeath: () => Q.set("li_rock_drone_done"),
      },
      W.anchors.rooftop.clone().setY(W.anchors.rooftop.y + 1.5),
    );
    if (a) a.hover = true;
  }

  // ---------- NPCs ----------
  const STOCK_BOOKS = [
    ["book_popular_circuits", 1],
    ["book_motor_manual", 1],
    ["book_radio_handbook", 1],
    ["rally_tonic", 3],
    ["prussian_blue", 2],
    ["purified_water", 4],
    ["old_world_book", 3],
  ];
  const STOCK_FERRO = [
    ["ammo_gyrojet", 80],
    ["ammo_308", 100],
    ["ammo_556", 120],
    ["gyrojet_pistol", 1],
    ["gyrojet_carbine", 1],
    ["belt_fed_mg", 1],
    ["combat_armor", 1],
    ["combat_helmet", 1],
    ["frag_grenade", 6],
    ["dry_cell", 2],
    ["scrap_electronics", 4],
    ["rally_tonic", 4],
  ];
  const STOCK_PELL = [
    ["ox_steak", 3],
    ["shellback_cakes", 3],
    ["golden_plain_jerky", 5],
    ["franks_and_beans", 4],
    ["purified_water", 6],
    ["fizzo_cola", 5],
    ["beer", 4],
    ["cinnamon_bun", 2],
  ];
  LI.spawnFns.push(function () {
    const C = LI.rock;
    if (!C) return;
    const A = C.anchors;
    const cov = (o, at) =>
      LI.spawnNPC(
        Object.assign(
          {
            type: "human",
            faction: "covenant",
            ai: "guard",
            homeR: 2,
            voice: "covenant",
          },
          o,
        ),
        at,
      );
    cov(
      {
        id: "li_cov_marsh",
        name: "Archivist Ottoline Pryor",
        outfit: "lab_coat",
        gender: "f",
        ai: "merchant",
        essential: true,
        dialogue: "dlg_li_marsh",
        level: 8,
        weapon: "gyrojet_pistol",
        hair: "bun",
        skinTone: 0.3,
        merchant: { scrip: 600, stock: STOCK_BOOKS, restock: 3 },
        barks: [
          "Shh.",
          "That goes back on the shelf you took it from.",
          "Knowledge keeps. People don't.",
        ],
      },
      A.marsh,
    );
    cov(
      {
        id: "li_cov_dalca",
        name: "Lancer Imre Dalca",
        outfit: "combat_armor",
        gender: "m",
        essential: true,
        dialogue: "dlg_li_dalca",
        level: 12,
        weapon: "gyrojet_carbine",
        skinTone: 0.45,
        barks: [
          "The map is not the territory. The map is, however, on my table.",
          "Eyes on the island.",
        ],
      },
      A.dalca,
    );
    cov(
      {
        id: "li_cov_ferro",
        name: "Lancer Ada Ferro",
        outfit: "combat_armor",
        gender: "f",
        ai: "merchant",
        essential: true,
        dialogue: "dlg_li_ferro",
        level: 10,
        weapon: "gyrojet_carbine",
        skinTone: 0.7,
        merchant: { scrip: 800, stock: STOCK_FERRO, restock: 3 },
        barks: [
          "Don't lean on the gantry.",
          "Rig batteries don't grow on trees. I checked.",
        ],
      },
      A.ferro,
    );
    cov(
      {
        id: "li_cov_pell",
        name: "Acolyte Quill",
        outfit: "settler",
        gender: "m",
        ai: "merchant",
        dialogue: "dlg_li_pell",
        level: 3,
        weapon: "combat_knife",
        skinTone: 0.5,
        merchant: { scrip: 250, stock: STOCK_PELL, restock: 2 },
        barks: ["Soup's on! Allegedly.", "Best view in Manhattan. Worst stew."],
      },
      A.cook,
    );
    cov(
      {
        id: "li_cov_harrow",
        name: "Lancer Hargrove",
        outfit: "covenant_exo_rig",
        gender: "m",
        level: 12,
        weapon: "gyrojet_carbine",
        homeR: 1.5,
        barks: [
          "Rockefeller Center. Iron Covenant ground. State your business.",
          "Iron keeps.",
          "Keep your weapon holstered on Covenant ground.",
        ],
      },
      A.npc1,
    );
    cov(
      {
        id: "li_cov_oyelaran",
        name: "Lancer Oyelaran",
        outfit: "covenant_exo_rig",
        gender: "f",
        level: 12,
        weapon: "gyrojet_carbine",
        homeR: 1.5,
        barks: [
          "Eyes front, Acolyte.",
          "The plaza's quiet. I hate it when the plaza's quiet.",
        ],
      },
      A.npc2,
    );
    cov(
      {
        id: "li_cov_acolyte",
        name: "Acolyte Moss",
        outfit: "settler",
        gender: "f",
        level: 3,
        weapon: "gyrojet_pistol",
        homeR: 1.2,
        barks: [
          "...clean the lens, check the cell, clean the lens...",
          "Lancer Ferro counts every round. EVERY round.",
        ],
      },
      A.acolyte,
    );
    cov(
      {
        id: "li_cov_mess",
        name: "Lancer Tamsin Roarke",
        outfit: "combat_armor",
        gender: "f",
        level: 9,
        weapon: "gyrojet_carbine",
        homeR: 1.0,
        barks: [
          "Quill, this is not stew. This is a crime scene.",
          "Best view in the world, and I'm looking at a bowl.",
        ],
      },
      A.lancer_mess1,
    );
    if (Q.stage(QID) === "climb") spawnRoofDrone();
  });
})();
