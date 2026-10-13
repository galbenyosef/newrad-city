/* src/poi_park/80_content.js */
/* =====================================================================
 * NEW RAD CITY — poi_park / 80_content.js
 * Gameplay content for the two Central Park POIs + their PK.define()
 * registrations (build = exterior + interior files):
 *
 *   ITEMS     — Gus's Pelt, the Zookeeper's Cap, Commissioner Moss's Hard
 *               Hat (uniques), Formula N, Rack of Pack oxen, Château
 *               Bellerive, the Ark password note, tape reels & notes.
 *   QUEST     — "Feeding Time" (Roz Tavish, Tavern on the Green): find out
 *               why the zoo's animals raid the Tavern's pack oxen pen → the
 *               Arsenal → the Army's Ark (Project N.O.A.H.) → restart the
 *               automatic feeders (merciful) or kill Gus, the white ash bear
 *               (the zoo's old polar bear) — or open every habitat gate and
 *               let the Ark loose on the Tavern (evil; the quest fails).
 *   NPCS      — Tavern: Roz Tavish (trader), Maurice (Valet maître
 *               d'), Chef Anton Moreau (food), Lillian (singer), Buck
 *               & Dee (guards), diners. Zoo: Gus (named boss), a few
 *               mutated animals loose among the enclosures.
 *   TERMINALS — Parks Dept. mainframe (Map Room), the Commissioner's
 *               personal terminal, Depot 14 duty terminal, Ark Control,
 *               Roz's reservation terminal.
 *   WORLD     — the Delacorte Clock (wind it; it also plays on the hour),
 *               lit groups at night, the feeder food pile, the Ark raid.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PK = G._ppk;
  const K = PK.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const q = K.q;
  const QF = "ppk_feeding_time";

  // ------------------------------------------------------------------
  // Locks (read by the site builders in init). Every unlock is placed in this module:
  //   ppk_term_commish  passcode CHESTNUT   the Parks map-room teletype (Arsenal)
  //   ppk_commish_safe  code 1934           the Commissioner's teletype ("Unlock Wall Safe" also releases it)
  //   ppk_noah          passcode LEVIATHAN, or the blotter note ppk_noah_password (Commissioner's office)
  //   ppk_roz_safe      code 0619           the Tavern office teletype
  // The keeper's service door into the Polar Circle is one-way (bolted from inside), not a lock.
  // ------------------------------------------------------------------
  PK.LOCKS = {
    commish_term: {
      id: "ppk_term_commish",
      label: "Office of the Commissioner — Teletype",
      kind: "terminal",
      passcode: "CHESTNUT",
      hint: "The Parks map-room teletype in the Arsenal.",
    },
    commish_safe: {
      id: "ppk_commish_safe",
      label: "Commissioner's Wall Safe",
      kind: "safe",
      code: "1934",
      hint: "The Commissioner's teletype.",
    },
    noah_term: {
      id: "ppk_noah",
      label: "Project N.O.A.H. — Ark Control",
      kind: "terminal",
      passcode: "LEVIATHAN",
      key: "ppk_noah_password",
      hint: "The note in the Commissioner's blotter.",
    },
    roz_safe: {
      id: "ppk_roz_safe",
      label: "Roz's Safe",
      kind: "safe",
      code: "0619",
      hint: "The Tavern office teletype.",
    },
  };
  for (const k in PK.LOCKS) PK.lockReg(PK.LOCKS[k]);

  const ctxOf = (id) => (PK.ctxs || []).find((c) => c.id === id);
  const V = (a) => (a ? { x: a.x, y: a.y, z: a.z } : null);
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  function isNight() {
    try {
      if (!G.isStub("atmos") && G.atmos.isNight) return !!G.atmos.isNight();
    } catch (e) {
      /* */
    }
    const h = (G.time && G.time.hour) || 12;
    return h < 6.5 || h > 19;
  }
  function marker(poi, name, label, interior) {
    return () => {
      const a = PK.anchor(poi, name);
      return a ? { x: a.x, z: a.z, y: a.y, label, interior } : null;
    };
  }
  const pname = () =>
    (G.HERO && G.HERO.name) || (G.player && G.player.name) || "stranger";

  // ==================================================================
  // Quest logic
  // ==================================================================
  function advanceTo(stage) {
    if (!q.started(QF)) return;
    if (q.active(QF)) q.set(QF, stage);
  }
  PK.park = {
    feedersOn: () => !!PK.flag("feeders_on"),
    gusDead: () => !!PK.flag("gus_dead"),
    resolved: () => !!PK.flag("feeders_on") || !!PK.flag("gus_dead"),
    restartFeeders() {
      if (PK.flag("feeders_on") || PK.flag("gates_open")) return;
      PK.setFlag("feeders_on", true);
      K.sfx("terminal_success");
      K.xp(120, "Restarted the Ark's feeders");
      K.standing(15, "Fed the Ark");
      const z = ctxOf("cp_zoo_arsenal");
      if (z && z.foodGroup) z.foodGroup.visible = true;
      const gus = actor("ppk_gus");
      if (gus && !gus.dead)
        K.safe("gus_calm", () => {
          if (gus.setHostile) gus.setHostile(false);
          gus.home = { x: z.anchors.feeder.x, z: z.anchors.feeder.z, r: 3 };
          if (gus.moveTo) gus.moveTo(z.anchors.feeder.x, z.anchors.feeder.z);
        });
      K.notify(
        "Somewhere below, a hopper clanks open. The Ark is feeding again.",
      );
      K.safe("news", () => {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "Good news for the folks at Tavern on the Green: no more night visitors at the pack oxen pen. Word is somebody went down under the old zoo and turned the Army's feeding machines back on. Twenty-two years late, but the animals got their dinner.",
          );
      });
      advanceTo("return");
    },
    openGates() {
      if (PK.flag("gates_open") || PK.flag("feeders_on")) return;
      PK.setFlag("gates_open", true);
      K.sfx("alarm");
      K.standing(-50, "Released the Ark");
      K.notify("Klaxons. Every habitat gate in the Ark grinds open.");
      if (q.active(QF)) q.fail(QF);
    },
  };

  // ==================================================================
  // DATA: items, quest, dialogues, terminals
  // ==================================================================
  function items() {
    K.defineItem({
      id: "ppk_gus_pelt",
      type: "misc",
      name: "Gus's Pelt",
      weight: 8,
      value: 300,
      tags: ["valuable", "unique"],
      desc: "Thick, yellow-white and patchy with pink scar tissue: the hide of the Central Park Zoo's last polar bear, two decades and a lot of Formula N later. Roz Tavish would pay for it. So would anyone with a fireplace.",
    });
    K.defineItem({
      id: "ppk_zookeeper_cap",
      type: "apparel",
      slot: "head",
      name: "Head Keeper's Cap",
      weight: 0.5,
      value: 90,
      dr: 1,
      attrs: { senses: 1 },
      skills: { survival: 5 },
      mesh: "hat_cap",
      tags: ["apparel", "hat", "unique"],
      desc: 'A green twill cap stitched "CENTRAL PARK ZOO — HEAD KEEPER". Smells faintly of herring. You notice things now: tracks, droppings, the way the shadows move.',
    });
    K.defineItem({
      id: "ppk_commish_hardhat",
      type: "apparel",
      slot: "head",
      name: "Commissioner Moss's Hard Hat",
      weight: 2,
      value: 160,
      dr: 4,
      attrs: { presence: 1 },
      skills: { mechanics: 5, trade: 5 },
      mesh: "hat_hard",
      tags: ["apparel", "helmet", "unique"],
      desc: 'A white ceremonial hard hat, gold-lettered "R. MOSS — COMMISSIONER". Worn at every ribbon-cutting for forty years. Never once worn near actual construction.',
    });
    K.defineItem({
      id: "ppk_formula_n",
      type: "aid",
      name: "Formula N",
      weight: 0,
      value: 60,
      tags: ["medical", "chem"],
      mesh: "injector",
      sound: "inject",
      effects: {
        hp: 25,
        rads: 20,
        duration: 240,
        attrs: { brawn: 1, grit: 1, wits: -1 },
      },
      desc: 'U.S. Army "adaptive nutritional supplement", 40 mg/kg, for animal use only. Makes you stronger, tougher and very, very hungry.',
    });
    K.defineItem({
      id: "ppk_rack_of_ox",
      type: "aid",
      name: "Rack of Pack oxen",
      weight: 1,
      value: 18,
      tags: ["food", "meat"],
      mesh: "steak",
      sound: "eat",
      effects: { hpOverTime: [60, 15] },
      desc: "Chef Anton's signature: two racks from one animal, crusted in dried gnarlberry and served with the solemnity of an old-world state dinner.",
    });
    K.defineItem({
      id: "ppk_tavern_wine",
      type: "aid",
      name: "Château Bellerive 1961",
      weight: 1,
      value: 45,
      tags: ["drink", "alcohol"],
      mesh: "bottle_wine",
      sound: "drink",
      effects: { hp: 10, duration: 240, attrs: { presence: 2, senses: 0 } },
      desc: "From the Tavern's cellar. A 1961 Bordeaux-style red from the Hudson Valley that has aged far better than the Hudson Valley.",
    });
  }

  function quests() {
    if (G.isStub("quests") || !G.quests.define) return;
    G.quests.define({
      id: QF,
      name: "Feeding Time",
      giver: "Roz Tavish",
      location: "Tavern on the Green",
      desc: "Something from the Central Park Zoo has been raiding the pack oxen pen at Tavern on the Green — last Tuesday, a white bear. Roz Tavish wants it stopped.",
      stages: [
        {
          id: "zoo",
          text: "Find out what is coming out of the Central Park Zoo at night.",
          markers: [marker("cp_zoo_arsenal", "door", "The Arsenal")],
        },
        {
          id: "ark",
          text: 'Search the Arsenal for a way down to the Army\'s "Ark".',
          markers: [
            marker(
              "cp_zoo_arsenal",
              "noah_terminal",
              "Ark Control",
              "cp_zoo_arsenal",
            ),
          ],
        },
        {
          id: "deal",
          text: "Stop the raids: restart the Ark's automatic feeders at Ark Control, or kill Gus in Biome B.",
          markers: [
            marker(
              "cp_zoo_arsenal",
              "noah_terminal",
              "Ark Control",
              "cp_zoo_arsenal",
            ),
            marker(
              "cp_zoo_arsenal",
              "boss",
              "Biome B — Polar",
              "cp_zoo_arsenal",
            ),
          ],
        },
        {
          id: "return",
          text: "Tell Roz Tavish at Tavern on the Green what you did.",
          markers: [{ npc: "ppk_roz", label: "Roz Tavish" }],
        },
      ],
      rewards: { xp: 300 },
    });
  }

  function terminals() {
    const T = (PK.TERMINALS = PK.TERMINALS || {});
    T.ppk_term_parks = {
      title: "NYC DEPT. OF PARKS & RECREATION",
      header: "ARSENAL MAINFRAME — MAP ROOM STATION 2",
      entries: [
        {
          title: "Memo: Teletype Passwords",
          learn: "ppk_term_commish",
          text: 'FROM: Office Services\n\nThe Commissioner has asked that his personal teletype password be changed from "PASSWORD". It is now CHESTNUT, after the tree outside his window. Please stop guessing it.',
        },
        {
          title: "Memo: Our Friends in Olive Drab",
          text: "FROM: Commissioner R. Moss\nTO: All Arsenal Staff\nRE: Project N.O.A.H.\n\nAs of this morning the lower level of this building and the Zoo service tunnels are under the authority of the U.S. Army, Civil Defense Depot 14.\n\nThe Army's National Organism Archive Habitat — \"the Ark\" — will shelter the Zoo's collection in the event of an attack.\n\nStaff are reminded that the Ark is for ANIMALS. This is not a metaphor.\n\n— R.M.",
        },
        {
          title: "Curator's Objection (Dr. S. Whitcombe)",
          text: 'Randall,\n\nThe Army\'s "Formula N" is going into every feed, 40 mg per kilo. They will not tell me what is in it.\n\nGus has not slept in seventy-two hours. He watches the keeper door. The penguins have started walking in formation. The burrow rat colony has doubled in a month and the rats are the size of cats.\n\nI am formally objecting. Again.\n\n— Stanley',
        },
        {
          title: "Visitor Statistics, Q4 1966",
          text: 'Attendance: 212,440 (−18%)\nMost popular exhibit: California Sea Lions\nLeast popular exhibit: "Tomorrow\'s Wildlife" (Civil Defense sponsored)\nComplaints: 1,207 (see: "Tomorrow\'s Wildlife")\nLost children: 44 (found: 43 — see Security)',
        },
        {
          title: "Diorama Maintenance Log",
          text: "1:1000 scale Central Park model:\n— replaced 400 trees (removed by children)\n— replaced Belvedere Castle (removed by child)\n— removed the Commissioner's proposed Expressway (installed by the Commissioner, again)",
        },
      ],
    };
    T.ppk_term_commish = {
      title: "OFFICE OF THE COMMISSIONER",
      header: "R. MOSS — PERSONAL TERMINAL",
      lock: PK.LOCKS.commish_term,
      entries: [
        {
          title: "Log — February 22, 1967",
          text: "Colonel Hallett came by again with his binders. If I sign the Depot 14 agreement the Army covers the Parks budget for a decade. A DECADE. I would sell the sea lions for a decade.\n\nI did not have to sell the sea lions. I only had to sign.",
        },
        {
          title: "Log — March 4, 1967",
          text: 'Whitcombe will not stop calling. He says Formula N makes the animals "adapt" — faster, meaner, hungrier. Isn\'t that the point? Hallett says the world after the war will belong to whatever adapts.\n\nI asked him where the Commissioner of Parks goes, after the war. He laughed for a long time.',
        },
        {
          title: "Ark Control Override",
          text: "Override word for Ark Control is on file with Stanley and with me.\n\nIt is LEVIATHAN.\n\n(Note for the Colonel: a password is not supposed to be the name of the project's mascot.)",
          action: () => {
            if (!K.has("ppk_noah_password")) {
              K.give("ppk_noah_password", 1);
              return "[Password copied to your goggles.]";
            }
            return "";
          },
        },
        {
          title: "Unlock Wall Safe",
          cond: () => !PK.flag("commish_safe_open"),
          learn: "ppk_commish_safe",
          action: () => {
            PK.setFlag("commish_safe_open", true);
            PK.safe("unlock", () => {
              if (PK.locksLive()) G.locks.unlock(PK.LOCKS.commish_safe.id);
            });
            const n = PK.unlockTagged("cp_zoo_arsenal", "commish_safe");
            K.sfx("keypad_accept");
            return n
              ? "> SAFE RELEASED."
              : "> RELAY CLICKS. (Nothing happens.)";
          },
          text: "> Sending release signal... (combination on file: 1934)",
        },
      ],
    };
    T.ppk_term_army = {
      title: "U.S. ARMY — CIVIL DEFENSE DEPOT 14",
      header: "DUTY TERMINAL — AUTHORIZED PERSONNEL",
      entries: [
        {
          title: "Orders 14-A",
          text: "Depot 14 will receive, shelter and sustain the specimens listed in Annex N.\n\nPersonnel will NOT enter the Ark after seal except to service the feeders.\n\nFormula N will be administered in all feeds at 40 mg/kg.\n\nIn the event of civilian attempts to enter the Ark: see Order 2.",
        },
        {
          title: "Duty Log — Sgt. Ruiz",
          text: "MAR 5 09:41 — Sirens. Radio says it's real.\n09:47 — Zoo staff on the stairs with families. Lt. Nwosu went down to talk to them.\n09:52 — Blast door sealed. The Lt. is on the other side. I don't know which side is the lucky one.\n\nI'm writing this down so it's written.",
        },
        {
          title: "Annex N — Specimen Manifest",
          text: 'P-1  Ursus maritimus ("GUS") ........ PRIORITY\nP-7  Panthera uncia ................. PRIORITY\nR-3  Heterocephalus glaber (colony, ~300) PRIORITY (?)\nA-9  Heloderma suspectum\nB-1  Ursus americanus (Bronx transfer)\nS-4  Zalophus californianus (pup)\nTZ   Tropic Zone insect house: Pandinus imperator, 60 specimens\n\nNOTE FROM THE LT.: Why are the naked burrow rats priority? Nobody can tell me.',
        },
      ],
    };
    T.ppk_term_noah = {
      title: "PROJECT N.O.A.H. — ARK CONTROL",
      header: "NATIONAL ORGANISM ARCHIVE HABITAT · DEPOT 14",
      lock: PK.LOCKS.noah_term,
      onUnlock: () => {
        if (q.active(QF) && (q.stage(QF) === "zoo" || q.stage(QF) === "ark"))
          q.set(QF, "deal");
      },
      entries: [
        {
          title: "Ark Status",
          text: () =>
            "BIOME A  TROPIC ...... BREACHED\nBIOME B  POLAR ....... " +
            (PK.flag("gates_open") ? "OPEN" : "SEALED") +
            "\nNIGHT HOUSE ........... OPEN\nFEEDING  AUTOMATIC ... " +
            (PK.flag("feeders_on")
              ? "ACTIVE (SUBSTITUTE STOCK: CULTURED PROTEIN)"
              : "SUSPENDED — FORMULA N STOCK DEPLETED 1969") +
            "\nGENERATOR ............ 61% (DIESEL / BATTERY BANK)\n\nSPECIMENS DETECTED: 9  (EXPECTED: 7)",
          action: () => {
            if (
              q.active(QF) &&
              (q.stage(QF) === "zoo" || q.stage(QF) === "ark")
            )
              q.set(QF, "deal");
            return "";
          },
        },
        {
          title: 'Specimen File: P-1 "GUS"',
          text: "Ursus maritimus. Male. Admitted 1962.\n\nFormula N response: EXCEPTIONAL. Mass +40%. Photophobia. Pigment loss (patchy). Cortisol off the chart. Subject no longer sleeps.\n\nKeeper's note (S.W.): He paces the same figure-eight he paced in 1964. He was the most neurotic bear in America and I loved him. Somebody, please, just feed him.",
        },
        {
          title: "RESUME AUTOMATED FEEDING",
          cond: () => !PK.flag("feeders_on") && !PK.flag("gates_open"),
          text: "> Formula N stock: 0 kg\n> Switching hoppers to substitute stock (cultured protein tanks, 71% capacity)...\n> Hopper B-1 ... OPEN\n> Hopper A-3 ... OPEN\n> Night House troughs ... OPEN\n\nFEEDING RESUMED.",
          action: () => {
            PK.park.restartFeeders();
            return "";
          },
        },
        {
          title: "EVACUATION: OPEN ALL HABITAT GATES",
          cond: () => !PK.flag("gates_open") && !PK.flag("feeders_on"),
          text: "> WARNING: THIS WILL RELEASE ALL SPECIMENS INTO THE PARK.\n> Confirmed.\n> Surface gates ... OPEN\n\nEVACUATION COMPLETE. GOOD LUCK, NEW YORK.",
          action: () => {
            PK.park.openGates();
            return "";
          },
        },
      ],
    };
    T.ppk_term_tavern = {
      title: "TAVERN ON THE GREEN",
      header: "RESERVATIONS · CATERING · SPECIAL EVENTS",
      entries: [
        {
          title: "Roz's Safe",
          learn: "ppk_roz_safe",
          text: "Note to self: the office safe is 0-6-1-9, Mama's birthday. If Buck is reading this — Buck, I will know.",
        },
        {
          title: "Reservations — Sunday, March 5, 1967",
          text: '12:00  Van Buren, party of 6 (anniversary — champagne on arrival)\n13:30  Mayor\'s office, party of 12 (Crystal Room, NO PRESS)\n19:00  Mr. Sinatra (Las Vegas) — DECLINED BY GUEST, "prior engagement"\n20:00  The Hendersons, party of 4 (window table, birthday cake)\n21:00  Civil Defense Regional Sales — the whole Crystal Room — PAID IN FULL',
        },
        {
          title: "Roz's Log — The Pen",
          text: "Three pack oxen gone in two weeks. Buck says the tracks come in over the East Drive from the zoo. Last night he saw it: white, big as a car, pink skin showing through the fur like it was sunburnt.\n\nNothing comes out of the zoo. Everybody knows that. People go IN.\n\nIf I don't fix this the trade wagons stop coming, and if the trade wagons stop coming the lights go out.",
        },
        {
          title: "Generator Log",
          text: 'Fuel: 3 weeks\nBulbs replaced this month: 212\nComplaints about "too many lights": 1 (Anton)\nMy answer: This is Tavern on the Green. The lights stay on.',
        },
      ],
    };
  }

  function dialogues() {
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const D = G.dialogue;

    // ---------------------------------------------------------------- Roz Tavish
    const payout = () => (PK.flag("roz_haggled") ? 200 : 150);
    const finishFeeders = () => {
      K.scrip(payout());
      K.give("ppk_rack_of_ox", 2);
      PK.setFlag("roz_discount", true);
      const a = actor("ppk_roz");
      if (a && a.merchant) a.merchant.priceMult = 0.9;
      if (!q.started(QF)) q.start(QF);
      q.complete(QF);
    };
    const finishKill = (pelt) => {
      K.scrip(payout() + (pelt ? 120 : 0));
      if (pelt) {
        K.take("ppk_gus_pelt", 1);
        PK.setFlag("pelt_given", true);
      }
      PK.setFlag("roz_discount", true);
      const a = actor("ppk_roz");
      if (a && a.merchant) a.merchant.priceMult = 0.9;
      if (!q.started(QF)) q.start(QF);
      q.complete(QF);
    };
    D.register("ppk_dlg_roz", {
      start: () =>
        q.done(QF)
          ? "after"
          : PK.flag("gates_open")
            ? "betrayed"
            : (q.active(QF) && q.stage(QF) === "return") ||
                (PK.park.resolved() && !q.done(QF))
              ? "report"
              : q.active(QF)
                ? "progress"
                : PK.flag("met_roz")
                  ? "again"
                  : "hello",
      nodes: {
        hello: {
          speaker: "Roz Tavish",
          onEnter: () => PK.setFlag("met_roz", true),
          text: "Welcome to the Tavern. Food's hot, beds are clean-ish, and the lights stay on. Roz Tavish — I run the place, and the trading. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "You look like someone with a problem.",
              next: "trouble",
              cond: () => !q.started(QF),
            },
            { text: "Tell me about the Tavern.", next: "about" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Roz Tavish",
          text: "Back again. Buying or selling?",
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "About your pack oxen problem...",
              next: "trouble",
              cond: () => !q.started(QF),
            },
            { text: "Tell me about the Tavern.", next: "about" },
            { text: "Goodbye.", end: true },
          ],
        },
        trouble: {
          speaker: "Roz Tavish",
          text: "Something's been coming over the East Drive at night and hitting the pack oxen pen. Three head in two weeks. burrow rats I could live with — but last Tuesday it was a bear. A WHITE bear, big as a car. Buck swears it came out of the zoo.\n\nNothing comes out of the zoo. Folks go in, sure. Nothing comes out.",
          responses: [
            {
              text: "I'll look into it.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
            { text: "What's in it for me?", next: "offer" },
            { text: "Not my problem.", end: true },
          ],
        },
        offer: {
          speaker: "Roz Tavish",
          text: "A hundred and fifty scrip, and a table in the Crystal Room whenever you want one.",
          responses: [
            {
              text: "Make it two hundred. Bears are expensive.",
              check: { skill: "trade", value: 40 },
              next: "haggle_ok",
              failNext: "haggle_no",
            },
            {
              text: "Deal.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        haggle_ok: {
          speaker: "Roz Tavish",
          text: "...Two hundred. And you're paying for your own wine.",
          onEnter: () => PK.setFlag("roz_haggled", true),
          responses: [
            {
              text: "Deal.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
          ],
        },
        haggle_no: {
          speaker: "Roz Tavish",
          text: "One-fifty and a table, or one-fifty and no table. Your pick.",
          responses: [
            {
              text: "Fine. One-fifty.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
            { text: "Forget it.", end: true },
          ],
        },
        yes: {
          speaker: "Roz Tavish",
          text: "The zoo's across the park, down by Fifth Avenue — the red castle is the Arsenal. The Army moved in right before the bombs. Whatever they were doing in there, I'd bet my generator it's why a polar bear is eating my pack oxen twenty-two years later.\n\nBring me an answer. Or a bear.",
          responses: [{ text: "On my way.", end: true }],
        },
        progress: {
          speaker: "Roz Tavish",
          text: () =>
            q.stage(QF) === "deal"
              ? "An ARK? Under the zoo? ...Of course there is. Can you shut it down, or feed it, or shoot it? I don't much care which."
              : "Any luck at the zoo? The Arsenal's the red castle on the Fifth Avenue side.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Still working on it.", end: true },
          ],
        },
        report: {
          speaker: "Roz Tavish",
          text: () =>
            PK.park.gusDead()
              ? "Buck says the night was quiet. And you've got that look. What happened out there?"
              : "Nothing at the pen last night. Nothing the night before. What did you DO?",
          responses: [
            {
              text: "The Army built an Ark under the zoo. The feeders shut down. I turned them back on.",
              cond: () => PK.park.feedersOn(),
              next: "fed",
            },
            {
              text: "It was the zoo's old polar bear, Gus. He's dead. [Give Gus's pelt]",
              cond: () => PK.park.gusDead() && K.has("ppk_gus_pelt"),
              next: "pelt",
              action: () => finishKill(true),
            },
            {
              text: "It was the zoo's old polar bear, Gus. He won't bother you again.",
              cond: () => PK.park.gusDead() && !PK.park.feedersOn(),
              next: "killed",
              action: () => finishKill(false),
            },
          ],
        },
        fed: {
          speaker: "Roz Tavish",
          text: "Twenty-two years and the Army's machine is still putting out dinner? ...Well. If that bear's eating down there, he isn't eating up here. That's smart. And kinder than I would've been.\n\nHere — your scrip, two racks from Anton, and Tavish Trading gives you the friends-and-family price from now on.",
          responses: [
            {
              text: "Pleasure doing business.",
              end: true,
              action: () => finishFeeders(),
            },
          ],
        },
        pelt: {
          speaker: "Roz Tavish",
          text: "Gus. It had a NAME. ...Lord, look at the size of it. That goes over the fireplace in the Chestnut Room, and every wagon master who drinks under it hears how you did it. Scrip — with a bonus for the rug — and you drink at family prices from now on.",
          responses: [{ text: "He had it rough, Roz.", end: true }],
        },
        killed: {
          speaker: "Roz Tavish",
          text: "Then that's that. I'd have liked to see it — no, I wouldn't. Here's your scrip. You drink at family prices from now on.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        betrayed: {
          speaker: "Roz Tavish",
          text: "Buck saw lights in the Arsenal before the animals came through the fence. burrow rats, scorpions, that bear — ALL of them, all at once. People got hurt.\n\nI don't know what you did down there, and I don't want to. Buy what you need and go.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
        after: {
          speaker: "Roz Tavish",
          text: () =>
            PK.flag("pelt_given")
              ? "Table's always open for you. Wagon masters keep asking about the bear rug. I tell them it was a big white rabbit."
              : "Table's always open for you. The pen's been quiet ever since.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Tell me about the Tavern.", next: "about" },
            { text: "Goodbye.", end: true },
          ],
        },
        about: {
          speaker: "Roz Tavish",
          text: "Built in 1870 for the sheep off the Sheep Meadow. A restaurant from 1934 until the bombs. My grandmother found it with the chandeliers still hanging and the wine still in the cellar, and she said: the lights go back on. So they did.\n\nCaravans stop here between the Neon and the Upper West Side. We feed them, water their pack oxen, and nobody pulls a gun inside. That's the whole trick.",
          responses: [
            { text: "Who else is here?", next: "who" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Roz Tavish",
          text: "Maurice at the door — he came with the building. Anton in the kitchen — so did he, technically; he was the sous-chef on March 5th. Lillian sings. Buck and Dee keep the gate. Don't tip Maurice, it confuses him.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Maurice (maître d')
    D.register("ppk_dlg_maurice", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Maurice",
          text: "Good evening, and welcome to Tavern on the Green! Do you have a reservation?",
          responses: [
            { text: () => 'Yes. Under "' + pname() + '".', next: "res" },
            { text: "No.", next: "walkin" },
            { text: "What is this place?", next: "history" },
            {
              text: "The Hendersons aren't coming, Maurice.",
              check: { skill: "persuasion", value: 40 },
              next: "hendersons",
              failNext: "hendersons_no",
              cond: () => PK.flag("read_res") || PK.flag("met_maurice"),
            },
            { text: "Goodbye.", end: true },
          ],
          onEnter: () => PK.setFlag("met_maurice", true),
        },
        res: {
          speaker: "Maurice",
          text: () =>
            'Ah — "' +
            pname() +
            "\"... I am terribly sorry. The last reservation in the book is for the Hendersons, party of four, eight o'clock, March the fifth, 1967. They are running a little late.\n\nBut we have had a table free for twenty-two years! Right this way.",
          onEnter: () => PK.setFlag("read_res", true),
          responses: [
            { text: "Thanks, Maurice.", end: true },
            { text: "What's good tonight?", next: "walkin" },
          ],
        },
        walkin: {
          speaker: "Maurice",
          text: "Walk-ins are always welcome! The chef recommends the pack oxen. The chef recommends the pack oxen every evening; it is the only item on the menu that did not attempt to eat him first. Madame Tavish trades at the bar in the Chestnut Room.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        history: {
          speaker: "Maurice",
          text: "Tavern on the Green! Built 1870 to house the sheep of the Sheep Meadow. A restaurant since 1934. The finest dining in Manhattan until March the fifth, 1967, and — in my professional opinion — still the finest dining in Manhattan, the competition being largely iguana on a stick.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        hendersons: {
          speaker: "Maurice",
          text: "...[His eye stalks droop.] I suspected. I shall hold their table another hour. As I have every hour since. Thank you for your candour. You are welcome here always.",
          onEnter: () => {
            if (!PK.flag("told_maurice")) {
              PK.setFlag("told_maurice", true);
              K.xp(25, "Told Maurice the truth");
            }
          },
          responses: [{ text: "Goodbye, Maurice.", end: true }],
        },
        hendersons_no: {
          speaker: "Maurice",
          text: "Nonsense! Traffic on the Henry Hudson is simply dreadful at this hour. Can I show you to the bar in the meantime?",
          responses: [{ text: "Sure.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Chef Anton Moreau
    D.register("ppk_dlg_anton", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Anton Moreau",
          text: "Out of my kitchen — unless you're buying. Anton Moreau. Sous-chef, class of 1967. Promoted to chef by attrition.",
          responses: [
            { text: "What's cooking?", barter: true },
            { text: "You were here on March 5th?", next: "day" },
            {
              text: "Your pack oxen is overcooked.",
              check: { skill: "survival", value: 35 },
              next: "critic",
              failNext: "critic_no",
              cond: () => !PK.flag("anton_critic"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        day: {
          speaker: "Anton Moreau",
          text: "Prep for the Civil Defense party. Nine hundred crab cakes. The windows went white, then the walk-in freezer saved my life, then the grease fire on the line took the side of my face. The crab cakes did not make it. Nobody remembers the crab cakes.",
          responses: [{ text: "I'm sorry about the crab cakes.", end: true }],
        },
        critic: {
          speaker: "Anton Moreau",
          text: "...Nobody has said that to me in twenty-two years. Everybody's just grateful it's not raw. [He pulls a plate off the pass.] Sit. You're getting the good one.",
          onEnter: () => {
            PK.setFlag("anton_critic", true);
            K.give("ppk_rack_of_ox", 1);
            K.xp(15, "A discerning palate");
          },
          responses: [{ text: "Merci, chef.", end: true }],
        },
        critic_no: {
          speaker: "Anton Moreau",
          text: "It's pack oxen. It's supposed to be like that. Get out of my kitchen.",
          responses: [{ text: "Fine.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Lillian (singer)
    D.register("ppk_dlg_lillian", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Lillian",
          text: "Hi, sugar. Requests? I know every song written before 1967 and none written after. Nobody's written any since.",
          responses: [
            { text: "Sing something.", next: "sing" },
            { text: "How'd you end up here?", next: "story" },
            { text: "Goodbye.", end: true },
          ],
        },
        sing: {
          speaker: "Lillian",
          text: "[She hums a few slow bars of something about the lights going out along Broadway, one by one, and a girl who kept hers burning in the window. The Crystal Room goes quiet. Somebody at the back is crying into a Fizzo Cola.]\n\n...That one's mine. Don't tell anybody.",
          onEnter: () => {
            if (!PK.flag("heard_lillian")) {
              PK.setFlag("heard_lillian", true);
              K.xp(10, "Heard Lillian sing");
            }
          },
          responses: [{ text: "That was beautiful.", end: true }],
        },
        story: {
          speaker: "Lillian",
          text: "Sang for a trade wagon out of the Neon for six years. We stopped here one night and the lights were on and the chandeliers were going and somebody had a real piano. I told the wagon boss to go on without me. That was nine years ago.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Buck (gate guard)
    D.register("ppk_dlg_buck", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Buck",
          text: () =>
            PK.park.resolved()
              ? "Quiet nights since you went to the zoo. I owe you a drink."
              : "Weapons holstered inside. Roz's rules. And if you see a white bear on your way in — you didn't, trust me — run.",
          responses: [
            {
              text: "A white bear?",
              next: "bear",
              cond: () => !PK.park.resolved(),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        bear: {
          speaker: "Buck",
          text: "Came over the East Drive last Tuesday. White fur, pink patches like it got boiled, eyes like a stoplight. It took a pack oxen in one bite and walked back toward the zoo like it had a bus to catch. Talk to Roz if you're crazy enough to go after it.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // World hooks: the Delacorte Clock, the feeder food pile
  // ==================================================================
  let clockT = 0,
    bellT = 0,
    noteT = 0,
    noteI = 0,
    lastHour = -1;
  const TUNE = [
    1.0, 1.26, 1.5, 1.26, 1.0, 0.84, 1.0, 1.12, 1.26, 1.12, 1.0, 0.75,
  ];
  function playClock(first) {
    const z = ctxOf("cp_zoo_arsenal");
    if (!z) return;
    clockT = 13;
    bellT = 0;
    noteT = 0;
    noteI = 0;
    if (first && !PK.flag("clock_wound")) {
      PK.setFlag("clock_wound", true);
      K.xp(15, "Wound the Delacorte Clock");
      K.notify(
        "Gears grind. The bronze animals lurch into motion and dance round the clock again.",
      );
    }
  }
  function worldHooks() {
    const z = ctxOf("cp_zoo_arsenal");
    if (z && z.clockCrank) {
      G.world.addInteractable({
        pos: z.clockCrank,
        radius: 1.0,
        label: "Delacorte Clock",
        verb: "Wind",
        priority: 1,
        enabled: () => clockT <= 0,
        onInteract() {
          K.sfx("key_turn", z.clockCrank);
          playClock(true);
        },
      });
    }
    // food pile in the polar trough (shown once the feeders run)
    if (z && z.intRoot) {
      const fb = K.builder({
        name: "zoo_food",
        off: z.O,
        lit: true,
        amb: [0.3, 0.3, 0.32],
        floors: [-4.5],
      });
      const rr = K.rng("food");
      for (let k = 0; k < 14; k++)
        fb.geo("meat", K.sphereGeo(), {
          x: -29.0 + (rr() - 0.5) * 1.8,
          y: -4.5 + 0.5 + rr() * 0.12,
          z: -60.2 + (rr() - 0.5) * 0.9,
          sx: 0.18,
          sy: 0.08,
          sz: 0.14,
          ry: rr() * 3,
          tint: [0.55, 0.3, 0.24],
        });
      fb.light(-29, -3.2, -60.2, [0.62, 0.82, 1.0], 0.6, 4);
      z.foodGroup = fb.finish(z.intRoot);
      z.foodGroup.visible = !!PK.flag("feeders_on");
    }
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function whiten(a) {
    K.safe("whiten", () => {
      const root = a && a.char && a.char.root;
      if (!root || root.userData.ppkWhite) return;
      root.userData.ppkWhite = true;
      root.traverse((o) => {
        if (
          !o.isMesh ||
          !o.geometry ||
          !o.geometry.attributes ||
          !o.geometry.attributes.color
        )
          return;
        const g = o.geometry.clone(),
          c = g.attributes.color;
        for (let i = 0; i < c.count; i++) {
          const r = c.getX(i),
            gg = c.getY(i),
            bb = c.getZ(i),
            l = Math.max(r, gg, bb);
          if (l < 0.45) {
            const k = 0.8 + l * 0.45;
            c.setXYZ(i, 0.88 * k, 0.86 * k, 0.76 * k);
          }
        }
        c.needsUpdate = true;
        o.geometry = g;
      });
      root.scale.multiplyScalar(1.28);
    });
  }
  function spawnZoo(ctx) {
    const A = ctx.anchors;
    if (ctx.foodGroup) ctx.foodGroup.visible = !!PK.flag("feeders_on");
    if (!PK.flag("gus_dead")) {
      const fed = !!PK.flag("feeders_on");
      const pos = fed ? V(A.feeder) : V(A.boss);
      const gus = PK.spawnActor(ctx, {
        id: "ppk_gus",
        type: "ash_bear",
        name: "Gus",
        faction: "creatures",
        level: 12,
        hostile: !fed,
        hp: 520,
        dr: 16,
        damage: 1.4,
        speed: 1.1,
        pos,
        yaw: PI,
        ai: "guard",
        home: { x: pos.x, z: pos.z, r: fed ? 3 : 7 },
        noRespawn: true,
        aggroRange: 22,
        loot: "creature",
        inventory: [
          ["ppk_gus_pelt", 1],
          ["ppk_formula_n", 1],
        ],
        barks: ["*huffing*", "*a long, low moan*", "*claws scraping concrete*"],
        onDeath: () => {
          if (PK.flag("gus_dead")) return;
          PK.setFlag("gus_dead", true);
          K.xp(150, "Killed Gus");
          K.notify("Gus, the Central Park Zoo's last polar bear, is dead.");
          if (q.active(QF) && q.stage(QF) !== "return") q.set(QF, "return");
        },
      });
      if (gus) {
        whiten(gus);
        gus.isBoss = true;
      }
    }
    // loose animals among the enclosures (outside)
    if (!PK.flag("zoo_ext_cleared")) {
      const ext = [
        ["ppk_zoo_rat1", "burrow_rat", "ext_spawn1"],
        ["ppk_zoo_rat2", "burrow_rat", "ext_spawn2"],
        ["ppk_zoo_scorp", "stinger", "ext_spawn3"],
      ];
      for (const [id, type, an] of ext) {
        if (!A[an]) continue;
        PK.spawnActor(ctx, {
          id,
          type,
          faction: "creatures",
          level: type === "stinger" ? 6 : 4,
          hostile: true,
          pos: V(A[an]),
          yaw: Math.random() * 6.28,
          ai: "wander",
          home: { x: A[an].x, z: A[an].z, r: 7 },
          noRespawn: true,
        });
      }
    }
  }
  function spawnTavern(ctx) {
    const A = ctx.anchors;
    const v = (n) => V(A[n]);
    const disc = PK.flag("roz_discount") ? 0.9 : 1;
    PK.spawnActor(ctx, {
      id: "ppk_roz",
      type: "human",
      gender: "f",
      outfit: "merchant",
      name: "Roz Tavish",
      faction: "settlers",
      level: 10,
      essential: true,
      pos: v("merchant"),
      yaw: HP,
      ai: "merchant",
      home: "here",
      homeR: 1.4,
      dialogue: "ppk_dlg_roz",
      voice: "settler",
      merchant: {
        scrip: 480,
        stock: K.stock(
          [
            ["rally_tonic", 3],
            ["prussian_blue", 2],
            ["iodine_tabs", 2],
            ["purified_water", 6],
            ["ammo_10mm", 40],
            ["ammo_12ga", 16],
            ["ammo_308", 10],
            ["scrap_metal", 8],
            ["ppk_rack_of_ox", 3],
            ["ppk_tavern_wine", 2],
            ["ox_milk", 4],
          ],
          "merchant_general",
          5,
        ),
        restock: 3,
        priceMult: disc,
      },
      barks: [
        "Buy, sell, swap. No credit.",
        "The lights stay on.",
        "Weapons holstered, please.",
        "Wagons are due Thursday.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_maurice",
      type: "valet",
      name: "Maurice",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v("maitre_d"),
      yaw: PI,
      ai: "static",
      home: "here",
      homeR: 0.3,
      dialogue: "ppk_dlg_maurice",
      voice: "robot",
      barks: [
        "Welcome to Tavern on the Green!",
        "Your table will be ready momentarily.",
        "Might I take your coat? Or your rifle?",
        "The Hendersons are running a little late.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_anton",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Anton Moreau",
      burn: "R",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v("chef"),
      yaw: 0,
      ai: "merchant",
      home: "here",
      homeR: 1.6,
      dialogue: "ppk_dlg_anton",
      voice: "settler",
      merchant: {
        scrip: 220,
        stock: K.stock(
          [
            ["ppk_rack_of_ox", 5],
            ["ox_milk", 3],
            ["wine", 3],
            ["beer", 6],
            ["purified_water", 4],
            ["frank_in_a_bun", 3],
          ],
          "merchant_food",
          3,
        ),
        restock: 2,
      },
      barks: [
        "Order up!",
        "Who touched my knives?",
        "It's PACK OXEN. It's supposed to taste like that.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_lillian",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Lillian",
      faction: "settlers",
      level: 4,
      essential: true,
      pos: v("singer"),
      yaw: 0,
      ai: "static",
      home: "here",
      homeR: 0.3,
      dialogue: "ppk_dlg_lillian",
      voice: "settler",
      barks: [
        "♪ ...one by one, the lights on Broadway... ♪",
        "♪ ...keep a candle in the window, darling... ♪",
        "This next one's for the Hendersons.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_diner1",
      type: "human",
      gender: "m",
      outfit: "drifter",
      name: "Wagon Hand",
      faction: "settlers",
      level: 4,
      pos: v("npc1"),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Best meal between here and the Neon.",
        "Don't look at the chandeliers too long. You'll cry.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_diner2",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Settler",
      faction: "settlers",
      level: 3,
      pos: v("npc2"),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Lillian's on at eight.",
        "They say the zoo animals come out at night.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_patron",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Wagon Master",
      faction: "settlers",
      level: 7,
      pos: v("npc3"),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Roz drives a hard bargain.",
        "Three days from Grand Central with a limping pack oxen.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_cellar",
      type: "human",
      gender: "m",
      outfit: "drifter",
      name: "Settler",
      faction: "settlers",
      level: 3,
      pos: v("npc4"),
      yaw: 0,
      ai: "wander",
      home: "here",
      homeR: 2.5,
    });
  }
  function spawnTavernOutside(ctx) {
    const A = ctx.anchors;
    PK.spawnActor(ctx, {
      id: "ppk_buck",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Buck",
      faction: "settlers",
      level: 9,
      pos: V(A.guard),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 2,
      weapon: "hunting_rifle",
      dialogue: "ppk_dlg_buck",
      voice: "settler",
      barks: [
        "Weapons holstered inside.",
        "Watch the East Drive after dark.",
        "Evening.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_dee",
      type: "human",
      gender: "f",
      outfit: "leather_armor",
      name: "Dee",
      faction: "settlers",
      level: 7,
      pos: V(A.guard2),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 3,
      weapon: "combat_shotgun",
      barks: [
        "Pen's across the drive.",
        "Keep your hands where I can see them.",
        "Nice night for it.",
      ],
    });
  }

  // ==================================================================
  // UPDATE: lit groups at night, the clock, the raid on the Tavern
  // ==================================================================
  let nightT = 0,
    night = false,
    raidT = 1;
  function updateAll(dt, realDt) {
    nightT -= realDt;
    if (nightT <= 0) {
      night = isNight();
      nightT = 2;
    }
    const zoo = ctxOf("cp_zoo_arsenal"),
      tav = ctxOf("tavern_on_green");
    if (zoo && zoo.litGroup) zoo.litGroup.visible = night;
    if (tav && tav.litGroup) tav.litGroup.visible = night;
    const p = G.player && G.player.pos;
    // the clock: on the hour when the player is near (outside), and whenever it's wound
    if (zoo && zoo.clockRing && p) {
      const h = Math.floor((G.time && G.time.hour) || 0);
      const near =
        p.x < G.LAYOUT.INTERIOR_X_MIN &&
        Math.abs(p.x - zoo.clockPos.x) < 60 &&
        Math.abs(p.z - zoo.clockPos.z) < 60;
      if (lastHour >= 0 && h !== lastHour && near && clockT <= 0 && dt > 0)
        playClock(false);
      lastHour = h;
      if (clockT > 0 && dt > 0) {
        clockT -= dt;
        zoo.clockRing.rotation.y += dt * 0.45 * Math.min(1, clockT / 1.5 + 0.1);
        bellT -= dt;
        noteT -= dt;
        if (bellT <= 0 && clockT > 3) {
          bellT = 2.2;
          K.sfx("melee_hit", zoo.clockPos, { pitch: 0.42, volume: 0.9 });
        }
        if (noteT <= 0 && clockT > 1.5) {
          noteT = 0.42;
          K.sfx("ui_select", zoo.clockPos, {
            pitch: TUNE[noteI % TUNE.length],
            volume: 0.5,
          });
          noteI++;
        }
      }
    }
    // the Ark let loose: one raid on the Tavern courtyard the next time the player is nearby outside
    if (PK.flag("gates_open") && !PK.flag("raid_done") && tav && p && dt > 0) {
      raidT -= realDt;
      if (raidT <= 0) {
        raidT = 1;
        const a = tav.anchors.courtyard;
        if (
          a &&
          p.x < G.LAYOUT.INTERIOR_X_MIN &&
          Math.hypot(p.x - a.x, p.z - a.z) < 110
        ) {
          PK.setFlag("raid_done", true);
          const list = [
            ["ppk_raid_bear", "ash_bear", "raid1"],
            ["ppk_raid_rat1", "burrow_rat", "raid2"],
            ["ppk_raid_rat2", "burrow_rat", "raid3"],
            ["ppk_raid_scorp", "stinger", "raid3"],
          ];
          for (const [id, type, an] of list) {
            const s = tav.anchors[an];
            if (s)
              PK.spawnActor(tav, {
                id,
                type,
                faction: "creatures",
                level: 8,
                hostile: true,
                pos: {
                  x: s.x + (Math.random() - 0.5) * 2,
                  y: s.y,
                  z: s.z + (Math.random() - 0.5) * 2,
                },
                ai: "wander",
                home: { x: s.x, z: s.z, r: 10 },
                noRespawn: true,
              });
          }
          K.notify(
            "Screams from Tavern on the Green — the Ark's animals are in the courtyard!",
          );
        }
      }
    }
  }

  // ==================================================================
  // Registrations
  // ==================================================================
  PK.onEnter = function (key) {
    K.safe("disc", () => G.discover(key));
    if (key === "cp_zoo_arsenal" && q.active(QF) && q.stage(QF) === "zoo")
      q.set(QF, "ark");
  };
  let dataDone = false;
  function dataOnce() {
    if (dataDone) return;
    dataDone = true;
    K.safe("items", items);
    K.safe("quests", quests);
    K.safe("terminals", terminals);
    K.safe("dialogues", dialogues);
    K.safe("hooks", worldHooks);
  }
  PK.define({
    id: "cp_zoo_arsenal",
    name: "Central Park Zoo & Arsenal",
    interior: "cp_zoo_arsenal",
    order: 10,
    lift: 5.0,
    build(ctx) {
      PK.EXT.zoo(ctx);
      PK.INT.zoo(ctx);
    },
    data: dataOnce,
    spawn: spawnZoo,
    update: updateAll,
    reset(ctx) {
      clockT = 0;
      lastHour = -1;
      if (ctx.foodGroup) ctx.foodGroup.visible = false;
      if (ctx.clockRing) ctx.clockRing.rotation.y = 0;
    },
  });
  PK.define({
    id: "tavern_on_green",
    name: "Tavern on the Green",
    interior: "tavern_on_green",
    order: 20,
    lift: 3.6,
    build(ctx) {
      PK.EXT.tavern(ctx);
      PK.INT.tavern(ctx);
    },
    data: dataOnce,
    spawn(ctx) {
      spawnTavern(ctx);
      spawnTavernOutside(ctx);
    },
  });
})();
