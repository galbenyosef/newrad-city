/* src/poi_theater/80_content.js */
/* =====================================================================
 * NEW RAD CITY — POI THEATER · 80 content
 * Items, notes & tape reels, terminals, dialogue, named NPCs, quests and
 * the scripted set pieces of the three Theater District POIs.
 *
 *  QUESTS
 *   pt_show      "Curtain Call" (Barnaby Thistlewood, Lyceum) — the
 *                Lyceum Players' premiere of "Our Glowing Town" needs the
 *                prompt book the Port Authority raiders stole and a working
 *                Klieg light from the Ed Sullivan Theater's Studio 50. Then
 *                take the front-row seat and watch the play.
 *   pt_deadair   "Dead Air" (Ed Sullivan) — restore the Studio 50 transmitter,
 *                find the master reel of the last "Tomorrow Hour" and put it
 *                back on the air from the control room.
 *   pt_locker417 "Locker 417" (Port Authority) — a claim check, a key in the
 *                baggage room's Lost & Found, and a coin locker nobody opened
 *                for twenty-two years.
 *  NPCs (Lyceum Players, friendly old troupers & co.): Barnaby Thistlewood
 *   (director), Genevieve Laurent (leading lady), Tess Carraway (stage
 *   manager & trader), Mortimer (bartender), Rosalind (makeup & mending —
 *   doctor), Ticket-Taker (patrolman usher), Horace (doorman, outside),
 *   two Lyceum Players. Ed Sullivan's robot MC "Mr. Showtime" (boss).
 * All writing original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pt) return;
  const P = G._pt;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];

  // ------------------------------------------------------------------
  // Locks (read by the site builders in init). Every unlock is placed in this module:
  //   pt_es_producer   passcode APPLAUSE  pencilled on the Tomorrow Hour cue cards (Studio 50 stage)
  //   pt_es_safe       code 5050          the producer's teletype (its remote release also opens it)
  //   pt_ly_strongbox  code 1903          Barnaby's ghost-light tape reel (Lyceum fly gallery)
  //   pt_pa_dispatch   passcode GATE206   the porter's tape reel (Port Authority baggage level)
  //   pt_pa_safe       code 4105          the dispatcher's teletype
  //   pt_pa_locker417  key pt_key_locker417 (Lost & Found, baggage level)
  // The Ed Sullivan stage door is one-way (bolted from inside), not a lock.
  // ------------------------------------------------------------------
  P.LOCKS = {
    es_producer: {
      id: "pt_es_producer",
      label: "Office of the Producer — Teletype",
      kind: "terminal",
      passcode: "APPLAUSE",
      hint: "Pencilled on the Tomorrow Hour cue cards.",
    },
    es_safe: {
      id: "pt_es_safe",
      label: "Producer's Safe",
      kind: "safe",
      code: "5050",
      hint: "The producer's teletype.",
    },
    ly_strongbox: {
      id: "pt_ly_strongbox",
      label: "Director's Strongbox",
      kind: "safe",
      code: "1903",
      hint: "Barnaby's ghost-light tape reel.",
    },
    pa_dispatch: {
      id: "pt_pa_dispatch",
      label: "Dispatcher — Upper Level Teletype",
      kind: "terminal",
      passcode: "GATE206",
      hint: "The porter's tape reel on the baggage level.",
    },
    pa_safe: {
      id: "pt_pa_safe",
      label: "Dispatcher's Safe",
      kind: "safe",
      code: "4105",
      hint: "The dispatcher's teletype.",
    },
    locker417: {
      id: "pt_pa_locker417",
      label: "Coin Locker 417",
      kind: "container",
      key: "pt_key_locker417",
      hint: "The Lost & Found on the baggage level.",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);
  // the cue cards are handed over by the stage interactable (not a world pickup): declare it for the locks audit
  G.events.on("initDone", () => {
    P.safe("cueSource", () => {
      if (P.locksLive() && G.locks.obtainableFrom)
        G.locks.obtainableFrom(
          "pt_note_es_cuecards",
          "Cue Cards on the Studio 50 stage",
        );
    });
  });
  P.onRelocated = P.onRelocated || [];
  P.tick = P.tick || [];

  // ------------------------------------------------------------------
  // persistent state (saved under G.save 'poi_theater' → content)
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    bookGiven: false,
    lightGiven: false,
    showDone: false,
    showsSeen: 0,
    bonusCaps: false,
    power: false,
    broadcast: false,
    locker: false,
    ticket: false,
    metBarnaby: false,
    safeReleased: false,
  });
  let F = DEF_STATE();
  C.F = () => F;
  P.saveHooks.content = {
    save: () => Object.assign({}, F),
    load: (d) => {
      F = Object.assign(DEF_STATE(), d || {});
      applyWorldState();
    },
  };

  // ------------------------------------------------------------------
  // safe wrappers
  // ------------------------------------------------------------------
  const has = (id, n) => {
    try {
      return !G.isStub("inventory") && G.inventory.count(id) >= (n || 1);
    } catch (e) {
      return false;
    }
  };
  const give = (id, n, silent) => {
    try {
      if (G.isStub("inventory")) return;
      if (id === "scrip" && G.inventory.addScrip) G.inventory.addScrip(n);
      else G.inventory.add(id, n || 1, silent ? { silent: true } : undefined);
    } catch (e) {
      G.reportError("poi_theater:give", e);
    }
  };
  const take = (id, n) => {
    try {
      if (!has(id, n)) return false;
      G.inventory.remove(id, n || 1);
      return true;
    } catch (e) {
      return false;
    }
  };
  const scrip = () => {
    try {
      return G.isStub("inventory")
        ? 0
        : G.inventory.scrip
          ? G.inventory.scrip()
          : G.inventory.count("scrip");
    } catch (e) {
      return 0;
    }
  };
  const pay = (n) => {
    if (scrip() < n) {
      G.notify("You don't have enough scrip.");
      G.sfx.play("ui_error");
      return false;
    }
    if (G.inventory.addScrip) G.inventory.addScrip(-n);
    else take("scrip", n);
    G.sfx.play("barter_trade");
    return true;
  };
  const xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* */
    }
  };
  const Q = () =>
    !G.isStub("quests") && G.quests && typeof G.quests.define === "function"
      ? G.quests
      : null;
  const qStage = (id) => {
    const q = Q();
    try {
      return q ? q.stage(id) : null;
    } catch (e) {
      return null;
    }
  };
  const qActive = (id) => {
    const q = Q();
    try {
      return !!(q && q.isActive(id));
    } catch (e) {
      return false;
    }
  };
  const qDone = (id) => {
    const q = Q();
    try {
      return !!(q && q.isComplete(id));
    } catch (e) {
      return false;
    }
  };
  const qSet = (id, st) => {
    const q = Q();
    if (q) P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => (st ? q.setStage(id, st) : q.start(id)));
  };
  const qComplete = (id) => {
    const q = Q();
    if (q && !q.isComplete(id)) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
  const news = (t) => {
    try {
      if (!G.isStub("radio") && G.radio.addNews) G.radio.addNews(t);
    } catch (e) {
      /* optional */
    }
  };
  C.helpers = {
    has,
    give,
    take,
    pay,
    xp,
    qStage,
    qActive,
    qDone,
    qSet,
    qStart,
    actor,
    A,
  };

  // ==================================================================
  // ITEMS
  // ==================================================================
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "note",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["note"],
          },
          extra || {},
        ),
      );
    const tape = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );
    // ---- quest items ----
    d({
      id: "pt_prompt_book",
      type: "misc",
      name: "The Lyceum Prompt Book",
      weight: 1,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["quest"],
      mesh: "book",
      desc: 'A fat three-ring binder: every line, cue and blocking note of "Our Glowing Town", in four colours of ink and one of something darker. The raiders used pages 40 to 55 to start a fire. Pages 40 to 55 were, according to the margin, "mostly the Stage Manager going on again".',
    });
    d({
      id: "pt_es_klieg",
      type: "misc",
      name: "Studio 50 Klieg Light",
      weight: 6,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["quest"],
      mesh: "lamp",
      desc: "A heavy carbon-arc studio spotlight, CBS inventory tag still riveted to the barrel. The lens is intact. Somebody wrapped it in a Civil Defense banner for safekeeping twenty-two years ago and never came back for it.",
    });
    d({
      id: "pt_es_master_reel",
      type: "misc",
      name: 'Master Reel: "The Tomorrow Hour" 03/05/67',
      weight: 2,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["quest"],
      mesh: "tape",
      desc: 'Two-inch quadruplex videotape in a dented aluminium can. The label, in grease pencil: "FINAL — DO NOT ERASE — AIRS 8 PM SUN". It never did.',
    });
    d({
      id: "pt_key_locker417",
      type: "key",
      name: "Coin Locker Key #417",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["key"],
      mesh: "key",
      desc: 'A flat brass key on an orange plastic tag stamped PORT AUTHORITY 417. Found in the Lost & Found drawer, in an envelope marked "HOLD FOR OWNER".',
    });
    // ---- unique apparel rewards ----
    d({
      id: "pt_players_mask",
      type: "apparel",
      slot: "eyes",
      name: "Lyceum Players' Comedy Mask",
      weight: 0.5,
      value: 180,
      attrs: { presence: 1 },
      skills: { persuasion: 10 },
      tags: ["apparel", "unique"],
      mesh: "glasses",
      desc: "A gilded papier-mâché comedy mask, grinning. Barnaby swears it was worn on this stage by a man who once made a president laugh until he fell off his chair. The president, not the man.",
    });
    d({
      id: "pt_host_tux",
      type: "apparel",
      slot: "body",
      name: "Tomorrow Hour Host's Tuxedo",
      weight: 2,
      value: 220,
      dr: 3,
      attrs: { presence: 1 },
      skills: { persuasion: 10, trade: 5 },
      outfit: "merchant",
      tags: ["apparel", "clothing", "unique"],
      mesh: "cloth_black",
      desc: 'Midnight-blue dinner jacket with Civil Defense gear cufflinks and a lapel pin that reads "ASK ME ABOUT YOUR FAMILY SHELTER". The inside pocket still holds a cue card: "SMILE — THEY CAN SEE YOU".',
    });
    d({
      id: "pt_commuter_fedora",
      type: "apparel",
      slot: "head",
      name: "Commuter's Fedora",
      weight: 1,
      value: 90,
      attrs: { senses: 1 },
      skills: { stealth: 5 },
      tags: ["apparel", "hat", "unique"],
      mesh: "hat_fedora",
      desc: "A grey felt fedora with a bus transfer tucked in the band: 8:40 TO PITTSBURGH, GATE 206. Its owner meant to come back for it after work.",
    });
    // ---- notes & tape reels (Ed Sullivan) ----
    note(
      "pt_note_es_fanletter",
      "Fan Letter to Jolly Jack",
      "Found on the star dressing table",
      'Dear Mr. Johnson,\n\nI watch THE TOMORROW HOUR every Sunday with my mother and my aunt Ruth and our Valet, Clarence. When you sing "Shelter Sweet Shelter" Clarence spins his arms. We think he likes you.\n\nMy mother says that when the bombs come we will go to the shelter like you say. My aunt Ruth says the bombs are not coming and you are just selling shelters. Please write back and say who is right.\n\nYour biggest fan,\nDorothy (age 9)\nBayonne, N.J.\n\n[Pinned underneath, in a different hand: "Jack — answer the kid. — Sid"]',
    );
    tape(
      "pt_reel_es_stagemgr",
      "Tape reel: Stage Manager's Log",
      "Sid Mancuso, Studio 50 — Sun. Mar. 5, 1967",
      "\"Log, the fifth, 9:15 AM, dress rehearsal. The network's pulling us. Civil defence has the airwaves. Mr. Showtime won't accept it. He keeps saying 'The show must go on' in that voice — the Civil Defense people gave him the pitch-bend chip, God help us.\n\n9:30. Power's dropping. I've shut down the transmitter in the basement so the civil defence boys don't accuse us of jamming them. The master reel of tonight's show is locked in Mr. Fairbanks's safe upstairs. If anybody ever finds this — the power switch is the big red one on the transmitter console, and the reel goes in machine two in the control room. Somebody should see it. Jack was good this morning.\n\n9:44. The Patrolmen are locking the doors. 'Nobody leaves during a live broadcast.' Showtime's orders. I'm going out through the trap room. If I—\"\n[Sirens. Tape ends.]",
    );
    // ---- Lyceum ----
    note(
      "pt_note_ly_critic",
      "A Review, Unfinished",
      "Found in the stage-left box",
      "THE RUINS HERALD — THEATER\n\"OUR GLOWING TOWN\" at the LYCEUM (preview)\n\nOne does not expect, crossing Eighth Avenue under raider fire, to be moved. One expects, at most, to be robbed. And yet the Lyceum Players — the original company, twenty-two years on, and several of them older than the building's last coat of paint — have mounted a play of such startling tenderness that this critic forgot, for three whole acts, that his left arm had been chewed.\n\nMiss Laurent, as Emily, is luminous. She is also forty-five, playing seventeen, and one believes every word. Mr. Thistlewood's Stage Manager is\n\n[The review ends. The critic is still in his seat. He appears to have enjoyed the show to the very end.]",
    );
    tape(
      "pt_reel_ly_ghostlight",
      "Tape reel: The Ghost Light",
      "Recorded on the Lyceum fly gallery",
      "\"This is Barnaby Thistlewood, and it is — I've stopped counting, I'm afraid — some years after. There's a tradition in the theater. When the house is dark, you leave one bare bulb burning on the stage. The ghost light. Some say it's so nobody falls into the pit. Some say it's for the ghosts, so they can do their plays at night.\n\nWhen the bombs fell we were in tech rehearsal. Nineteen of us stayed in the building. Four of us didn't see the spring. The rest of us kept rehearsing. And every night someone checks the ghost light.\n\nIt hasn't gone out once. Not in twenty-two years. I think that's the whole point of theatre, really. Someone keeps the light on, and eventually someone else comes in out of the dark to see what it's for. Oh — and if anyone finds this: the director's strongbox is one-nine-oh-three. The year we opened. Of course it is.\"",
      { learn: "pt_ly_strongbox" },
    );
    tape(
      "pt_reel_ly_opening",
      "Tape reel: Opening Night Speech",
      "Barnaby Thistlewood, Mar. 5, 1967 (rehearsal)",
      '"—no, from the top. Ahem. Ladies and gentlemen, welcome to the Lyceum, the oldest continuously operating legitimate theatre on Broadway, where tonight— [a distant siren] —where TONIGHT, despite everything in the newspapers— [a much louder siren] ...Genevieve, dear, is that part of the sound design? ...Genevieve?"',
    );
    // ---- Port Authority ----
    note(
      "pt_note_pa_newspaper",
      "The First Journal, Mar. 4, 1967",
      "Late City Edition",
      'THE FIRST JOURNAL — LATE CITY — 5¢\n"You heard it here first."\n\nCOMMUTERS SNARL AT PORT AUTHORITY AS CITY "PREPARES"\nMayor Urges Calm: "Take the Bus Like Normal People"\n\nLines stretched down Eighth Avenue this afternoon as thousands sought seats on westbound coaches. A Silver Arrow dispatcher, who declined to give his name, reported selling "every ticket to Pittsburgh in the building, and some to places that aren\'t on the map." Gate 206 departed 40 minutes late.\n\nALSO INSIDE: Civil Defense "Tomorrow Hour" may be pre-empted Sunday — Lyceum opens Sunday night "on schedule" — Brooklyn Sugar Works cereal recall "not related to anything".',
    );
    note(
      "pt_note_pa_claimcheck",
      "Claim Check #417",
      "A damp slip of card",
      "PORT AUTHORITY BUS TERMINAL — COIN LOCKERS\nCLAIM CHECK  No. 417\nDeposited: 03/05/67  7:58 AM\nValid 24 HOURS. After 24 hours contents removed to LOST & FOUND, BAGGAGE LEVEL.\n\n[On the back, in pencil:] Marge — suitcase is in 417. Key's at Lost & Found if I miss the 8:40. Don't wait for me. Get on the bus. — H.",
    );
    tape(
      "pt_reel_pa_porter",
      "Tape reel: Porter's Dictation",
      "Baggage room recorder, Mar. 5, 1967",
      "\"Baggage level, Walter Grimes, porter, dictating for the incident book. Sunday, nine-thirty-five. Crowd upstairs is something terrible. Folks leaving whole trunks on the carousel and running for the gates.\n\nA gentleman came down about eight — hat, raincoat, sad eyes — asked me to hold his locker key in the Lost & Found for his wife, Margaret. I put it in an envelope. HOLD FOR OWNER. She never came.\n\nNine-forty-seven. The lights just went white. Everything went white. I'm going to sit with the bags for a while. Somebody ought to. If the dispatcher upstairs wants me, his teletype password's GATE206, same as the sign over his door.\"",
      { learn: "pt_pa_dispatch" },
    );
    tape(
      "pt_reel_pa_final_bus",
      "Tape reel: Gate 206",
      "Found in locker 417",
      "\"Marge. If you're hearing this you got the suitcase. There's money in the lining and my good hat — you always said it made me look like a detective. I'm going to try for the 8:40. If I don't make it... take the bus. Go west. Find somewhere with a porch. I love you. Get on the bus.\"",
    );
    note(
      "pt_note_es_cuecards",
      "Cue Cards (Tomorrow Hour)",
      "A rubber-banded stack",
      '1. "GOOD EVENING, AMERICA!" (wait for applause)\n2. "Tonight on the Tomorrow Hour: Jolly Jack Johnson! The Civil Defense Singers! And a very special message about YOUR FAMILY\'S FUTURE!"\n3. "Folks, they ask me — Jack, what happens when the bombs fall? And I tell them: I\'ll be in a Civil Defense shelter, doing two shows a night!" (big laugh — if no laugh, Mr. Showtime to sound cue 12)\n4. "...and remember: the safest place to watch tomorrow is from a Civil Defense shelter!" (APPLAUSE sign — HOLD IT)\n\n[Pencilled on the last card:] Harold — your teletype password is APPLAUSE. You made me write it down. Burn this. — Sid',
      { learn: "pt_es_producer" },
    );
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function defineTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    const T = (id, def) =>
      P.safe("term:" + id, () => G.terminals.register(id, def));
    T("pt_es_security", {
      title: "STUDIO 50 — LOBBY SECURITY",
      header: "COLUMBIA BROADCASTING — STUDIO 50\nVisitor Services Telelink",
      entries: [
        {
          title: "Visitor Log (03/05/67)",
          text: '08:02  Studio audience, TOMORROW HOUR Sunday-morning dress (recorded for tonight) — 212 ticket holders admitted\n08:30  Civil Defense sponsor representative (Mr. Albrecht) — VIP box\n09:15  CIVIL DEFENCE NOTICE RECEIVED — tonight\'s broadcast pre-empted\n09:41  Audience asked to remain seated by MR. SHOWTIME (robot MC). Audience remained seated.\n09:44  Doors locked by usher units. Reason given: "LIVE BROADCAST IN PROGRESS."',
        },
        {
          title: "Robot Staff Roster",
          text: 'MS-1 "MR. SHOWTIME" — American Automaton Co. entertainment unit (Valet chassis, Civil Defense personality package "MASTER OF CEREMONIES")\nPU-1 to PU-4 — American Automaton Patrolman ushers ("Please remain seated")\nNOTE: Do not let MS-1 near the vision mixer. He believes he is the director.',
        },
        {
          title: "Maintenance Ticket #5021",
          text: 'Usher units will not accept "the show is over" as a valid command. Suggest a software patch. Or a sledgehammer.\n— E. Rojas, Facilities',
        },
      ],
    });
    T("pt_es_producer", {
      title: "OFFICE OF THE PRODUCER",
      header:
        "THE TOMORROW HOUR — Harold Fairbanks, Producer\nPersonal Telelink",
      lock: P.LOCKS.es_producer,
      entries: [
        {
          title: "Memo: Sponsor Notes",
          text: 'From: Civil Defense Public Relations\nRe: Sunday\'s script\n\nPlease cut the sketch where Jack pretends the shelter hatch is stuck. Test audiences found it "less funny than intended" and "specifically upsetting". Replace with additional footage of the model family-shelter swimming pool. Family shelters do not have swimming pools. Please do not mention this.',
        },
        {
          title: "Memo: Mr. Showtime",
          text: 'Harold — the robot improvised again. Eleven minutes on "why the audience must never leave". The network loved it. I did not love it. The audience did not leave. — Sid',
        },
        {
          title: "Master Reel",
          learn: "pt_es_safe",
          text: "Tonight's master is in my office safe (5-0-5-0, Studio 50 twice). If the network wants it they can come and get it themselves. Remote release below.",
        },
        {
          title: "Release office safe lock",
          text: "> SAFE SOLENOID RELEASED.\nThe safe in the corner clunks.",
          action: () => {
            F.safeReleased = true;
            P.safe("unlock", () => {
              if (P.locksLive()) G.locks.unlock(P.LOCKS.es_safe.id);
            });
            releaseSafe();
          },
        },
      ],
    });
    T("pt_es_transmitter", {
      title: "STUDIO 50 TRANSMITTER",
      header:
        "RCA TT-50 TRANSMITTER — Engineering Console\nWARNING: HIGH VOLTAGE",
      entries: [
        {
          title: "Transmitter Status",
          text: () =>
            F.power
              ? "MAIN POWER: ON\nPLATE VOLTAGE: NOMINAL-ISH\nCARRIER: READY\nThe valves glow a deep, hopeful blue."
              : "MAIN POWER: OFF (manual shutdown 03/05/67 09:30 — S. Mancuso)\nEMERGENCY BUS: 11%\nSTANDBY LIGHTING ONLY.",
        },
        {
          title: "Engage Main Power",
          cond: () => !F.power,
          text: "> ENGAGING MAIN POWER...\n> PLATE VOLTAGE RISING\n> The building shudders. Somewhere above, a studio monitor blinks on.",
          action: () => C.restorePower(),
        },
        {
          title: "Engineer's Note",
          text: "If you're reading this, the robots are still upstairs and still on shift. Mr. Showtime draws his audience-counting routine from the house lights. Kill the lights and he'll stand on the stage forever, waiting for a show. — E. Rojas",
        },
      ],
    });
    T("pt_es_control", {
      title: "STUDIO 50 CONTROL ROOM",
      header:
        "THE TOMORROW HOUR — Master Control\nTape Machine 2 · Vision Mixer · Transmitter Link",
      entries: [
        {
          title: "Program Log",
          text: 'SUN 03/05/67 — THE TOMORROW HOUR (DRESS, RECORDED FOR 8 P.M. AIR)\n08:30 Cold open (Jack)\n08:34 Civil Defense Singers — "Shelter Sweet Shelter"\n08:41 Sketch: "The Stuck Door" (CUT per sponsor)\n08:49 Mr. Showtime — audience participation\n09:01 A Message About Your Family\'s Future\n09:28 Good night',
        },
        {
          title: "Broadcast Status",
          text: () =>
            F.broadcast
              ? "ON AIR.\nTHE TOMORROW HOUR — 03/05/67 master — looping on all channels the old mast can reach."
              : !F.power
                ? "TRANSMITTER LINK: NO POWER\n(see engineering console, basement)"
                : "TRANSMITTER LINK: READY\nTAPE MACHINE 2: EMPTY",
        },
        {
          title: "Load Master Reel & Go To Air",
          cond: () => !F.broadcast && F.power && has("pt_es_master_reel"),
          text: "> THREADING REEL ON MACHINE 2... OK\n> ROLLING\n> VISION MIXER: CAMERA 1\n> TRANSMITTER: CARRIER UP\n\nThe ON AIR signs flicker, then burn red. Somewhere in the dark auditorium a recorded audience begins to applaud.",
          action: () => C.goToAir(),
        },
        {
          title: "Load Master Reel & Go To Air",
          cond: () => !F.broadcast && (!F.power || !has("pt_es_master_reel")),
          text: () =>
            !F.power
              ? "> ERROR: TRANSMITTER LINK HAS NO POWER."
              : "> ERROR: NO REEL ON MACHINE 2.",
        },
        {
          title: "Monitor: Final Show (playback)",
          cond: () => F.broadcast,
          text: 'On the flickering monitor a man with a very white smile and a very blue tuxedo taps the microphone. "Good evening, America! ...Folks, they tell me we\'re being pre-empted tonight. Pre-empted! By what? By the future!" Laughter. "And you know what they say about the future: it\'s coming whether you\'ve got a shelter or not!" The laughter falters. The man keeps smiling. He smiles for the whole hour.',
        },
      ],
    });
    T("pt_ly_director", {
      title: "LYCEUM — DIRECTOR'S OFFICE",
      header: "THE LYCEUM PLAYERS\n(est. 1967, rather unexpectedly)",
      entries: [
        {
          title: "Company Roster",
          text: "BARNABY THISTLEWOOD — Artistic Director, Stage Manager (the part AND the job)\nGENEVIEVE LAURENT — Emily Webb (since 1967; has not aged a day. Has aged every other way.)\nTESS CARRAWAY — Stage Manager (the job), props, provisions, the only one of us with a pulse\nROSALIND — Makeup, wigs, wounds\nMORTIMER — Front of house, bar, bouncer\nTICKET-TAKER — Usher (salvaged; unpaid; happier than any of us)",
        },
        {
          title: "Rehearsal Notes",
          text: 'Act I: FASTER. We have been doing this play for twenty-two years and it has gotten longer every decade.\nAct II: The wedding. Mortimer, the "Maniac guests" are a JOKE, stop howling at the audience.\nAct III: Lights. We need a real spot for Emily\'s last speech. The old Kliegs at Studio 50 across town — CBS kept a dozen. If only someone could get past those wretched robots.\nALSO: WHO TOOK THE PROMPT BOOK. (Tess says raiders. Tess says it with a straight face.)',
        },
        {
          title: "Accounts",
          text: "Tickets sold this season: 31\nScrip: 155\nScrip owed by Mortimer to the bar: 155\nNet: art",
        },
      ],
    });
    T("pt_pa_dispatch", {
      title: "DISPATCHER — UPPER LEVEL",
      header:
        "PORT AUTHORITY BUS TERMINAL\nUpper Level Dispatch · Gates 201-206",
      lock: P.LOCKS.pa_dispatch,
      entries: [
        {
          title: "Cash Safe",
          learn: "pt_pa_safe",
          text: "Dispatcher's cash safe: 4-1-0-5. Night drawer only. — Mgmt",
        },
        {
          title: "Dispatch Log (03/05/67)",
          text: "07:55 All westbound gates at capacity\n08:40 G206 Pittsburgh — 11 over manifest, departed 09:21\n09:30 Lincoln Tunnel closed by order of NYPD\n09:40 G203 cancelled (driver did not report)\n09:44 All gates hold.\n09:47 —",
        },
        {
          title: "THE TOLL LEDGER (raider)",
          text: "WHO PAYD\n- trade wagon guy: 40 scrip + 1 pack oxen (ate it)\n- old guy w/ hat: 5 scrip + hat\n- kid: 0 scrip (let him go, dont tell nobody)\n- that DRAMA lady from 45th: 1 BIG BOOK (worth nothing?? keep it anyway, BOSS likes the pictures)",
        },
        {
          title: "Gate Status",
          text: "G201 BOSTON — HOLD\nG202 PHILADELPHIA — HOLD\nG203 ATLANTIC CITY — CANCELLED\nG204 ALBANY — HOLD\nG205 THE COMMONWEALTH — HOLD\nG206 PITTSBURGH — HOLD\n\nHOLD HOLD HOLD HOLD HOLD HOLD",
        },
      ],
    });
  }

  // ==================================================================
  // DIALOGUE
  // ==================================================================
  function defineDialogue() {
    if (G.isStub("dialogue") || typeof G.dialogue.register !== "function")
      return;
    const R = (id, tree) =>
      P.safe("dlg:" + id, () => G.dialogue.register(id, tree));
    const left = () =>
      [
        !(F.bookGiven || has("pt_prompt_book")),
        !(F.lightGiven || has("pt_es_klieg")),
      ].filter(Boolean).length;
    // ---------------- Barnaby Thistlewood (director, quest giver) ----------------
    R("dlg_pt_barnaby", {
      start: () =>
        qDone("pt_show")
          ? "after"
          : qStage("pt_show") === "showtime"
            ? "showtime"
            : qActive("pt_show")
              ? "progress"
              : F.metBarnaby
                ? "again"
                : "first",
      nodes: {
        first: {
          speaker: "Barnaby Thistlewood",
          onEnter: () => {
            F.metBarnaby = true;
          },
          text: "A patron! An actual, ambulatory patron! Forgive me — we get so few who arrive through the door rather than the ceiling. Barnaby Thistlewood, artistic director of the Lyceum Players. Welcome to the oldest legitimate theatre on Broadway. Mind the third row; it bites.",
          responses: [
            { text: "The Lyceum Players?", next: "troupe" },
            { text: "What are you performing?", next: "play" },
            { text: "You've all been in here since '67?", next: "stayed" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Barnaby Thistlewood",
          text: [
            "Back again! The house recognises you. Well — the house recognises everyone, it has been waiting twenty-two years for anyone.",
            "Ah, our patron returns. Have you reconsidered helping a poor company in distress?",
          ],
          responses: [
            { text: "Tell me about the play again.", next: "play" },
            { text: "What do you need?", next: "problem" },
            { text: "Goodbye.", end: true },
          ],
        },
        troupe: {
          speaker: "Barnaby Thistlewood",
          text: "Nineteen of us were in tech rehearsal on the fifth of March, 1967. We did not leave. The Bombing took our audience, our electricity and, in Mortimer's case, his sense of rhythm — but not our lines. We have performed every night since. The audiences have been... patchy.",
          responses: [
            { text: "What's the show?", next: "play" },
            { text: "Every night for twenty-two years?", next: "every" },
          ],
        },
        every: {
          speaker: "Barnaby Thistlewood",
          text: "Excepting the Great Burrow Rat Intermission of 1974, yes. Some nights to an empty house. Some nights to the rats. One unforgettable night to a Brute who wept at the wedding scene and then ate the usher. We have a new usher.",
          responses: [{ text: "And the play?", next: "play" }],
        },
        stayed: {
          speaker: "Barnaby Thistlewood",
          text: "Darling, the theatre has always been run by people too stubborn to leave. The Bombing simply gave us a very good excuse.",
          responses: [{ text: "Fair enough. What's playing?", next: "play" }],
        },
        play: {
          speaker: "Barnaby Thistlewood",
          text: '"Our Glowing Town." An original work, three acts. A small town in New Hampshire, after the end of the world: birth, love, marriage, radiation, and the dawning realisation that nobody ever notices their life while they\'re living it. I play the Stage Manager. I narrate. At length. It was supposed to open on the night of March fifth. We are running a touch late.',
          responses: [
            { text: "When's the premiere?", next: "problem" },
            { text: "Sounds lovely. Goodbye.", end: true },
          ],
        },
        problem: {
          speaker: "Barnaby Thistlewood",
          text: "Ah. There's the rub. We cannot open. Two catastrophes: first, the raiders who squat in the Port Authority terminal \"collected a toll\" from Tess last week — and the toll was our prompt book. The only complete script in existence. Second, Act Three needs a proper spotlight for Emily's farewell, and our last good lamp died in '83.",
          responses: [
            {
              text: "I'll get your book back — and find you a light.",
              next: "accept",
              action: () => qStart("pt_show", "gather"),
            },
            {
              text: "[Persuasion 50] A dangerous job. The patronage of the arts had better pay.",
              check: { skill: "persuasion", value: 50 },
              next: "pay",
              failNext: "payFail",
            },
            { text: "Not my problem.", next: "refuse" },
          ],
        },
        pay: {
          speaker: "Barnaby Thistlewood",
          text: "A critic AND a negotiator. Very well: the company will scrape together an additional hundred scrip, and you shall have the best seat in the house for life. The best seat is the one that doesn't bite.",
          onEnter: () => {
            F.bonusCaps = true;
          },
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => qStart("pt_show", "gather"),
            },
          ],
        },
        payFail: {
          speaker: "Barnaby Thistlewood",
          text: "Pay? My dear, we pay in ART. And the occasional scrip, when Mortimer hasn't drunk the float. We'll see what we can do.",
          responses: [
            {
              text: "Fine. I'll help.",
              next: "accept",
              action: () => qStart("pt_show", "gather"),
            },
            { text: "Forget it.", end: true },
          ],
        },
        refuse: {
          speaker: "Barnaby Thistlewood",
          text: "Of course, of course. The Ruins are full of things more important than theatre. Food. Water. Not being shot. I simply maintain that none of them are more INTERESTING.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        accept: {
          speaker: "Barnaby Thistlewood",
          text: 'Bravo! The Port Authority Bus Terminal is at Eighth and 41st — raiders, cages, a boss who styles himself "the Dispatcher". Our book will be wherever he keeps his treasure. As for light: the old Ed Sullivan Theater, north on Eighth. CBS\'s Studio 50. They kept Klieg lights like other people keep spoons. Unfortunately it is staffed entirely by robots who refuse to acknowledge the show is over.',
          responses: [{ text: "I'll be back.", end: true }],
        },
        progress: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            left() === 0
              ? "Is that — do you have — oh, don't keep an old ham in suspense!"
              : "Still " +
                left() +
                " thing" +
                (left() > 1 ? "s" : "") +
                " standing between us and opening night: the prompt book from the Port Authority raiders, and a Klieg light from Studio 50. We rehearse in the meantime. From memory. Badly.",
          responses: [
            {
              text: "Here's your prompt book.",
              cond: () => !F.bookGiven && has("pt_prompt_book"),
              next: "gotBook",
              action: () => {
                if (take("pt_prompt_book")) {
                  F.bookGiven = true;
                  xp(50, "Returned the prompt book");
                }
              },
            },
            {
              text: "I brought you a Klieg light.",
              cond: () => !F.lightGiven && has("pt_es_klieg"),
              next: "gotLight",
              action: () => {
                if (take("pt_es_klieg")) {
                  F.lightGiven = true;
                  xp(50, "Delivered the Klieg light");
                }
              },
            },
            {
              text: "Remind me about the prompt book.",
              cond: () => !F.bookGiven,
              next: "rBook",
            },
            {
              text: "Remind me about the light.",
              cond: () => !F.lightGiven,
              next: "rLight",
            },
            { text: "I'm working on it.", end: true },
          ],
        },
        gotBook: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            "My book! My beautiful— they burned pages forty to fifty-five. Of course they did. Those were mostly me. No matter, I know them by heart. I know everything by heart. " +
            (F.lightGiven
              ? "And with the light already rigged... we open TONIGHT."
              : "Now, if only we had light to see it by."),
          responses: [{ text: "Continue.", next: "checkDone" }],
        },
        gotLight: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            "A Studio 50 Klieg! Look at that lens. Tess! TESS! Get this on the balcony rail before Genevieve sees it and demands it for every scene. " +
            (F.bookGiven
              ? "And the book is home. My friend — we open TONIGHT."
              : "Now we need only words to illuminate."),
          responses: [{ text: "Continue.", next: "checkDone" }],
        },
        checkDone: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            F.bookGiven && F.lightGiven
              ? "Places, everyone! PLACES! And you — you take the seat of honour. Front row, centre aisle. The one with the little brass plate. Curtain up in two minutes."
              : "One down! Onward.",
          onEnter: () => {
            if (
              F.bookGiven &&
              F.lightGiven &&
              qStage("pt_show") !== "showtime"
            ) {
              qSet("pt_show", "showtime");
              C.setupShow();
            }
          },
          responses: [{ text: "Break a leg.", end: true }],
        },
        rBook: {
          speaker: "Barnaby Thistlewood",
          text: "Port Authority, Eighth Avenue at 41st. Tess says the raider boss holes up in the old dispatcher's office on the upper bus level. Bring the book, and anything else of ours you find. Also bring yourself back. That part is important.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        rLight: {
          speaker: "Barnaby Thistlewood",
          text: "The Ed Sullivan Theater on Eighth, near 53rd — the one with the great vertical sign. Studio 50. The lighting store was upstairs by the control room, if memory serves, and memory always serves. It just serves slowly.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        showtime: {
          speaker: "Barnaby Thistlewood",
          text: "Places! Take your seat — front row, centre. The one with the brass plate. We begin when you sit.",
          responses: [{ text: "On my way.", end: true }],
        },
        after: {
          speaker: "Barnaby Thistlewood",
          text: [
            "Did you see their faces? Well — Mortimer's face. It was very moved. He blew his nose on the curtain.",
            "We play every night now. Come back any time; the seat is yours. It no longer bites. Much.",
            "Twenty-two years, and we finally had an audience that clapped in the right places. I may retire. I won't. But I may.",
          ],
          responses: [
            { text: "I'd like to see it again.", next: "again2" },
            { text: "Good night, Barnaby.", end: true },
          ],
        },
        again2: {
          speaker: "Barnaby Thistlewood",
          text: "An encore! Take your seat, front row centre, and we'll run it from the top.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    // ---------------- Genevieve Laurent ----------------
    R("dlg_pt_vivienne", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Genevieve Laurent",
          text: [
            "Oh! An audience. Do I look all right? No — don't answer. Nobody's answered that question honestly since 1967.",
            "I was twenty-three when I was cast as Emily. I am forty-five now. It is still, technically, a stretch.",
            "The trick to Emily's last speech is that you must mean it every time. After the first ten years, that's the only trick left.",
          ],
          responses: [
            { text: "What was it like, before?", next: "before" },
            { text: "Why keep doing the same play?", next: "why" },
            { text: "You look wonderful.", next: "flatter" },
            { text: "Goodbye.", end: true },
          ],
        },
        before: {
          speaker: "Genevieve Laurent",
          text: 'Before? Stage-door Johnnies with orchids. Photographers. A write-up in the Herald: "Miss Laurent, a young talent to watch." Well — they could watch. Nobody told them how long for.',
          responses: [{ text: "Go on.", next: "hi" }],
        },
        why: {
          speaker: "Genevieve Laurent",
          text: "Because it's a play about noticing. About how nobody notices their life while it's happening. We had twenty-two years to notice ours. You'd be surprised how much there is. Even in here. Especially in here.",
          responses: [{ text: "I see.", next: "hi" }],
        },
        flatter: {
          speaker: "Genevieve Laurent",
          text: "Liar. Lovely, generous liar. Come to the show and lie to me again at the stage door afterwards.",
          responses: [{ text: "It's a date.", end: true }],
        },
      },
    });
    // ---------------- Tess Carraway (trader) ----------------
    R("dlg_pt_tess", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Tess Carraway",
          text: [
            "Tess Carraway, stage manager — the job, not the part; Barnaby does the part. Props, provisions, ammunition. Only one in the company under fifty, so I also handle anything involving stairs.",
            "Need something? I've got props that shoot and props that don't. Price is the same.",
            "Barnaby says we're a family. I say families don't make you run the rope-lines at three in the morning.",
          ],
          responses: [
            { text: "Let's trade.", barter: true, next: "hi" },
            {
              text: "What happened to the prompt book?",
              cond: () => !F.bookGiven,
              next: "book",
            },
            {
              text: "How does a kid end up running a troupe of old hams?",
              next: "human",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        book: {
          speaker: "Tess Carraway",
          text: 'I went out for lamp oil and walked straight into a raider "toll" on Eighth. They took my scrip, my boots and the book. The boss up in the terminal liked the pictures — Barnaby draws blocking diagrams. Little stick men. The raider thinks it\'s a comic.',
          responses: [{ text: "I'll see about it.", next: "hi" }],
        },
        human: {
          speaker: "Tess Carraway",
          text: "Walked in during a rainstorm when I was eleven. Genevieve gave me soup and a costume. Barnaby gave me a clipboard. Twenty years later I'm still holding the clipboard. Don't tell them I like it.",
          responses: [{ text: "Your secret's safe.", next: "hi" }],
        },
      },
    });
    // ---------------- Mortimer (bartender) ----------------
    R("dlg_pt_mortimer", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Mortimer",
          text: [
            "Welcome to Mortimer's. Intermission specials all day, because every day is intermission.",
            "What'll it be? I got Fizzo, I got beer, I got something in a bathtub that I call gin.",
            "Drinks are for paying customers. Talking is free, but I charge for listening.",
          ],
          responses: [
            {
              text: "Let's see what you're pouring.",
              barter: true,
              next: "hi",
            },
            { text: "Heard any rumours?", next: "rumours" },
            { text: "Goodbye.", end: true },
          ],
        },
        rumours: {
          speaker: "Mortimer",
          text: [
            "The Ed Sullivan up on Eighth? Robots still running the show. Scav went in last month, came out with a program and a nervous twitch. Said the robot MC made him sit through the whole hour.",
            "Port Authority raiders strung a cage up in the concourse. Say there's a bus up top nobody's been able to move since the war. Say a lot of things, raiders.",
            "There's a bank of coin lockers in the Port Authority nobody's cracked. Twenty-two years of luggage. I'd look, if I didn't hate bus stations.",
          ],
          responses: [{ text: "Thanks.", next: "hi" }],
        },
      },
    });
    // ---------------- Rosalind (makeup & mending — doctor) ----------------
    R("dlg_pt_rosalind", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Rosalind",
          text: [
            "Sit, sit. Makeup, wigs, wounds. The principles are the same: cover it, colour it, send them back on.",
            "You're bleeding on my good floor. Twenty scrip and I'll make you presentable.",
          ],
          responses: [
            {
              text: "Patch me up. (20 scrip)",
              next: "healed",
              cond: () => scrip() >= 20,
              action: () => {
                if (pay(20)) {
                  try {
                    if (!G.isStub("rpg") && G.rpg.doctorHeal)
                      G.rpg.doctorHeal("all");
                    else G.player.heal(999);
                  } catch (e) {
                    G.player.heal(999);
                  }
                  G.sfx.play("inject");
                }
              },
            },
            { text: "Let me see your supplies.", barter: true, next: "hi" },
            { text: "Goodbye.", end: true },
          ],
        },
        healed: {
          speaker: "Rosalind",
          text: "There. Good as new. Newer, possibly; I used the good greasepaint. Try not to die in the second act.",
          responses: [{ text: "Thanks, Rosalind.", end: true }],
        },
      },
    });
    // ---------------- Ticket-Taker (patrolman usher) ----------------
    R("dlg_pt_usher", {
      start: () => (F.ticket ? "hasTicket" : "hi"),
      nodes: {
        hi: {
          speaker: "Ticket-Taker",
          text: "GOOD EVENING. WELCOME TO THE LYCEUM. TICKETS ARE FIVE (5) SCRIP. CHILDREN AND SENIORS ARE FREE. PLEASE DO NOT DISCHARGE FIREARMS DURING THE PERFORMANCE.",
          responses: [
            {
              text: "[Pay 5 scrip] One ticket, please.",
              cond: () => scrip() >= 5,
              next: "paid",
              action: () => {
                if (pay(5)) {
                  F.ticket = true;
                }
              },
            },
            {
              text: "I was born before the war. I'm a senior. Honest.",
              next: "senior",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        paid: {
          speaker: "Ticket-Taker",
          text: "THANK YOU. YOUR SEAT IS: ANYWHERE. ENJOY THE SHOW. THE SHOW IS: GOOD.",
          responses: [{ text: "Thanks.", end: true }],
        },
        senior: {
          speaker: "Ticket-Taker",
          text: "SCANNING... BIRTH YEAR: PLAUSIBLE. FACE: IMPLAUSIBLE. VERDICT: NOT A SENIOR. HOWEVER, YOUR HONESTY RATING IS: ENTERTAINING. ADMIT ONE.",
          onEnter: () => {
            F.ticket = true;
          },
          responses: [{ text: "Thank you.", end: true }],
        },
        hasTicket: {
          speaker: "Ticket-Taker",
          text: [
            "ENJOY THE SHOW.",
            "PLEASE SILENCE ALL GEIGER COUNTERS.",
            "THE MANAGEMENT IS NOT RESPONSIBLE FOR LOST LIMBS.",
          ],
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    // ---------------- Horace (doorman, outside) + players ----------------
    R("dlg_pt_horace", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Horace",
          text: [
            "Evening. Show's inside. Guns stay holstered in the house or you'll be finding out what I do between acts.",
            "Lyceum Players. Best — and only — theatre on Broadway.",
            "Raiders from the Port Authority come up this way now and then. They don't come up twice.",
          ],
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    R("dlg_pt_player", {
      start: "hi",
      nodes: {
        hi: {
          text: [
            'Shh — running lines. "The sun comes up over the crater about quarter to six..."',
            "Twenty-two years of Act Two. You would think I would stop crying at the wedding.",
            "Barnaby says I have the best death scene in the company. I have the ONLY death scene in the company. It's a small cast.",
          ],
          responses: [{ text: "Break a leg.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    const inOrOut = (poi, name, label, ext, extLabel) => () =>
      P.inCell(poi)
        ? mk(poi, name, label)()
        : mk(poi, ext || "exterior_entrance", extLabel || label)();
    P.safe("quest:show", () =>
      q.define({
        id: "pt_show",
        name: "Curtain Call",
        giver: "Barnaby Thistlewood",
        location: "Lyceum Theatre",
        desc: 'The Lyceum Players — a company of actors who never left the theatre after the bombs — want to finally open "Our Glowing Town". Raiders at the Port Authority stole their only prompt book, and Act Three needs a real spotlight.',
        stages: [
          {
            id: "talk",
            text: "Speak with Barnaby Thistlewood at the Lyceum Theatre.",
            markers: inOrOut(
              "lyceum_theatre",
              "director",
              "Barnaby Thistlewood",
            ),
          },
          {
            id: "gather",
            text: () =>
              "Help the Lyceum Players open their play (" +
              [
                F.bookGiven || has("pt_prompt_book"),
                F.lightGiven || has("pt_es_klieg"),
              ].filter(Boolean).length +
              "/2).",
            markers: () =>
              has("pt_prompt_book") && has("pt_es_klieg")
                ? inOrOut("lyceum_theatre", "director", "Barnaby Thistlewood")()
                : [],
          },
          {
            id: "g_book",
            text: "Recover the Lyceum prompt book from the raiders at the Port Authority Bus Terminal.",
            sideObjective: true,
            doneIf: () => F.bookGiven || has("pt_prompt_book"),
            showIf: () => qStage("pt_show") === "gather",
            markers: () =>
              F.bookGiven || has("pt_prompt_book")
                ? []
                : inOrOut(
                    "port_authority",
                    "prompt_book",
                    "The Dispatcher's Office",
                  )(),
          },
          {
            id: "g_light",
            text: "Salvage a Klieg light from Studio 50 at the Ed Sullivan Theater.",
            sideObjective: true,
            doneIf: () => F.lightGiven || has("pt_es_klieg"),
            showIf: () => qStage("pt_show") === "gather",
            markers: () =>
              F.lightGiven || has("pt_es_klieg")
                ? []
                : inOrOut("ed_sullivan", "klieg", "Studio 50 Lighting Store")(),
          },
          {
            id: "g_return",
            text: "Bring what you found to Barnaby Thistlewood.",
            sideObjective: true,
            doneIf: () => F.bookGiven && F.lightGiven,
            showIf: () =>
              qStage("pt_show") === "gather" &&
              (has("pt_prompt_book") || has("pt_es_klieg")),
            markers: inOrOut(
              "lyceum_theatre",
              "director",
              "Barnaby Thistlewood",
            ),
          },
          {
            id: "showtime",
            text: 'Take the front-row seat in the Lyceum for the premiere of "Our Glowing Town".',
            markers: inOrOut("lyceum_theatre", "seat", "The Seat of Honour"),
          },
        ],
        rewards: {
          xp: 350,
          scrip: 150,
          items: [["pt_players_mask", 1]],
          standing: 10,
        },
      }),
    );
    P.safe("quest:deadair", () =>
      q.define({
        id: "pt_deadair",
        name: "Dead Air",
        giver: "Sid Mancuso's log",
        location: "Ed Sullivan Theater",
        desc: 'On March 5th, 1967, "The Tomorrow Hour" was pre-empted by the end of the world. Its master reel is still in Studio 50. The stage manager\'s last wish: that somebody would see it.',
        stages: [
          {
            id: "prep",
            text: () =>
              "Get Studio 50 back on the air (" +
              [F.power, F.broadcast || has("pt_es_master_reel")].filter(Boolean)
                .length +
              "/2).",
          },
          {
            id: "p_power",
            text: "Engage main power at the transmitter console in the basement.",
            sideObjective: true,
            doneIf: () => F.power,
            showIf: () => qStage("pt_deadair") === "prep",
            markers: () =>
              F.power
                ? []
                : inOrOut(
                    "ed_sullivan",
                    "transmitter",
                    "Transmitter Console",
                    "stage_door",
                    "Ed Sullivan Theater",
                  )(),
          },
          {
            id: "p_reel",
            text: 'Find the master reel of the last "Tomorrow Hour" (the producer\'s office).',
            sideObjective: true,
            doneIf: () => has("pt_es_master_reel") || F.broadcast,
            showIf: () => qStage("pt_deadair") === "prep",
            markers: () =>
              has("pt_es_master_reel")
                ? []
                : inOrOut("ed_sullivan", "producer_safe", "Producer's Safe")(),
          },
          {
            id: "broadcast",
            text: "Load the master reel at the control room terminal and put Studio 50 on the air.",
            markers: inOrOut("ed_sullivan", "control_terminal", "Control Room"),
          },
        ],
        rewards: { xp: 300, items: [["pt_host_tux", 1]] },
      }),
    );
    P.safe("quest:locker", () =>
      q.define({
        id: "pt_locker417",
        name: "Locker 417",
        giver: "A claim check",
        location: "Port Authority Bus Terminal",
        desc: "A claim check for coin locker 417, deposited on the morning the bombs fell. \"Key's at Lost & Found if I miss the 8:40. Don't wait for me.\"",
        stages: [
          {
            id: "key",
            text: "Find the key to locker 417 in the Lost & Found on the baggage level.",
            markers: () =>
              has("pt_key_locker417")
                ? mk("port_authority", "locker417", "Locker 417")()
                : inOrOut("port_authority", "lost_found", "Lost & Found")(),
          },
          {
            id: "open",
            text: "Open coin locker 417 in the Port Authority concourse.",
            markers: inOrOut("port_authority", "locker417", "Locker 417"),
          },
        ],
        rewards: { xp: 150 },
      }),
    );
  }

  // ==================================================================
  // NPCs (Lyceum Players)
  // ==================================================================
  const NPCS = [
    {
      id: "pt_barnaby",
      poi: "lyceum_theatre",
      at: "director",
      type: "human",
      name: "Barnaby Thistlewood",
      outfit: "merchant",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pt_barnaby",
      level: 6,
      barks: [
        "From the top!",
        "Projection, darlings, PROJECTION.",
        "Twenty-two years and still no understudy.",
      ],
    },
    {
      id: "pt_vivienne",
      poi: "lyceum_theatre",
      at: "npc1",
      type: "human",
      name: "Genevieve Laurent",
      outfit: "dj",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_pt_vivienne",
      level: 5,
      barks: [
        "Mama, look at the sky. It's GREEN.",
        "Line?",
        "Nobody ever looks. Nobody ever LOOKS.",
      ],
    },
    {
      id: "pt_player1",
      poi: "lyceum_theatre",
      at: "npc2",
      type: "human",
      name: "Lyceum Player",
      outfit: "settler",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pt_player",
      level: 4,
    },
    {
      id: "pt_player2",
      poi: "lyceum_theatre",
      at: "npc3",
      type: "human",
      name: "Lyceum Player",
      outfit: "drifter",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_pt_player",
      level: 4,
    },
    {
      id: "pt_tess",
      poi: "lyceum_theatre",
      at: "merchant",
      type: "human",
      name: "Tess Carraway",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pt_tess",
      level: 6,
      faction: "settlers",
      weapon: "pistol_10mm",
      merchant: {
        scrip: 450,
        table: "merchant_general",
        extra: [
          ["rally_tonic", 3],
          ["ammo_10mm", 60],
          ["ammo_32", 40],
          ["purified_water", 4],
          ["old_world_formalwear", 1],
          ["top_hat", 1],
          ["showgirl_costume", 1],
        ],
      },
    },
    {
      id: "pt_mortimer",
      poi: "lyceum_theatre",
      at: "bartender",
      type: "human",
      name: "Mortimer",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pt_mortimer",
      level: 6,
      merchant: {
        scrip: 250,
        table: "merchant_food",
        extra: [
          ["beer", 6],
          ["whiskey", 2],
          ["fizzo_cola", 5],
          ["purified_water", 3],
          ["prairie_root_beer", 3],
        ],
      },
    },
    {
      id: "pt_rosalind",
      poi: "lyceum_theatre",
      at: "doctor",
      type: "human",
      name: "Rosalind",
      outfit: "doctor",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pt_rosalind",
      level: 5,
      merchant: {
        scrip: 300,
        table: "merchant_doctor",
        extra: [
          ["rally_tonic", 4],
          ["prussian_blue", 2],
          ["iodine_tabs", 2],
          ["morphine_syrette", 1],
        ],
      },
    },
    {
      id: "pt_usher",
      poi: "lyceum_theatre",
      at: "usher",
      type: "patrolman",
      name: "Ticket-Taker",
      ai: "guard",
      dialogue: "dlg_pt_usher",
      level: 5,
      voice: "robot",
    },
    {
      id: "pt_horace",
      poi: "lyceum_theatre",
      at: "guard_ext",
      type: "human",
      name: "Horace",
      outfit: "leather_armor",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pt_horace",
      level: 7,
      weapon: "hunting_rifle",
    },
  ];
  C.NPCS = NPCS;
  function stockFor(m) {
    const out = [];
    const ok = (id) => {
      try {
        return !G.isStub("items") && !!G.items.get(id);
      } catch (e) {
        return false;
      }
    };
    if (m.table) {
      try {
        const r = G.items.rollLoot(m.table, 8);
        if (Array.isArray(r))
          for (const e of r) if (ok(e[0])) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    for (const e of m.extra || []) if (ok(e[0])) out.push([e[0], e[1]]);
    return out;
  }
  function spawnNPC(def) {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return null;
    const ex = actor(def.id);
    if (ex && !ex.removed) return ex;
    const a = A(def.poi, def.at);
    if (!a) return null;
    const sd = {
      id: def.id,
      type: def.type,
      name: def.name,
      faction: def.faction || "settlers",
      level: def.level || 5,
      pos: { x: a.x, y: a.y, z: a.z },
      yaw: a.yaw || 0,
      ai: def.ai || "guard",
      home: { x: a.x, z: a.z, r: def.ai === "guard" ? 1.5 : 1.0 },
      dialogue: def.dialogue,
      essential: true,
      hostile: false,
      noRespawn: true,
      holdPos: def.ai !== "wander",
    };
    if (def.outfit) sd.outfit = def.outfit;
    if (def.gender) sd.gender = def.gender;
    if (def.barks) sd.barks = def.barks;
    if (def.voice) sd.voice = def.voice;
    if (def.weapon) {
      try {
        if (!G.isStub("items") && G.items.get(def.weapon))
          sd.weapon = def.weapon;
      } catch (e) {
        /* */
      }
    } else sd.weapon = "none";
    if (def.merchant)
      sd.merchant = {
        scrip: def.merchant.scrip,
        stock: stockFor(def.merchant),
        restock: 3,
      };
    return P.safe("spawn:" + def.id, () => G.actors.spawn(sd));
  }
  function spawnAll() {
    for (const d of NPCS) spawnNPC(d);
  }

  // ==================================================================
  // SET PIECES
  // ==================================================================
  // ---------- Ed Sullivan: power + go to air ----------
  function releaseSafe() {
    for (const S of P.sites)
      for (const c of S.containers)
        if (c.name === "Producer's Safe" && c.handle) {
          try {
            c.handle.locked = 0;
          } catch (e) {
            /* */
          }
        }
  }
  C.restorePower = function () {
    if (F.power) return;
    F.power = true;
    G.sfx.play("hum_electric", { volume: 0.8 });
    const a = A("ed_sullivan", "loot2");
    if (a)
      try {
        G.fx.flash(a.clone().setY(a.y + 1.5), 0x80b8ff, 3, 0.6);
      } catch (e) {
        /* */
      }
    G.notify("Deep in the building, a transformer hums awake.");
    xp(40, "Restored Studio 50 power");
    qStart("pt_deadair", "prep");
    checkDeadAir();
  };
  C.goToAir = function () {
    if (F.broadcast) return;
    F.broadcast = true;
    take("pt_es_master_reel");
    if (P.esOnAir) P.esOnAir.visible = true;
    G.sfx.play("terminal_success");
    G.notify("STUDIO 50 IS ON THE AIR.");
    news(
      "Strange one tonight, folks. Somebody up on Eighth Avenue got old Studio 50 humming — and what's coming out of it is a Civil Defense variety hour from the day the bombs fell. The host is still smiling. Tune your sets. Or maybe don't.",
    );
    if (!qActive("pt_deadair") && !qDone("pt_deadair"))
      qStart("pt_deadair", "broadcast");
    if (qActive("pt_deadair")) {
      qSet("pt_deadair", "broadcast");
      qComplete("pt_deadair");
    }
  };
  function checkDeadAir() {
    if (!qActive("pt_deadair") || qStage("pt_deadair") !== "prep") return;
    if (F.power && has("pt_es_master_reel")) qSet("pt_deadair", "broadcast");
  }

  // ---------- Port Authority: locker 417 ----------
  C.openLocker = function () {
    if (F.locker) {
      G.notify(
        "Locker 417 is empty now. Somebody finally came for the luggage.",
      );
      return;
    }
    F.locker = true;
    G.sfx.play("container_open");
    give("pt_commuter_fedora", 1);
    give("scrip", 175);
    give("pt_reel_pa_final_bus", 1);
    give("fizzo_blue", 1);
    give("shade_field", 1);
    G.notify(
      "Inside: a hard-shell suitcase, a hat, a tape reel, and money sewn into the lining.",
    );
    if (!qActive("pt_locker417") && !qDone("pt_locker417"))
      qStart("pt_locker417", "open");
    qComplete("pt_locker417");
  };

  // ---------- Lyceum: the performance ----------
  const SHOW = [
    [
      "pt_barnaby",
      'This play is called "Our Glowing Town". It takes place in Grover\'s Crater, New Hampshire — just after the end of the world.',
      7,
    ],
    [
      "pt_barnaby",
      "The sun comes up over the crater about quarter to six. Well — something comes up. We call it the sun. It's polite to.",
      7,
    ],
    ["pt_player2", "Emily! Take your Prussian Blue. You're growing.", 5],
    ["pt_vivienne", "Mama, am I pretty? Tell me the truth, Mama.", 5],
    [
      "pt_player2",
      "You're pretty enough for all normal purposes. And some abnormal ones.",
      6,
    ],
    [
      "pt_barnaby",
      "Act Two. Love and marriage. The wedding was lovely. Only four of the guests were Maniacs, and two of them were family.",
      8,
    ],
    [
      "pt_player1",
      "Emily Webb... will you... I got us a two-headed pack oxen. One head each.",
      6,
    ],
    ["pt_vivienne", "Oh, George. Yes. Both heads. Yes.", 5],
    [
      "pt_barnaby",
      "Act Three. Nine years go by. Then two hundred. In our town, the dead sit in the hill and wait. They get very good at waiting.",
      8,
    ],
    [
      "pt_vivienne",
      "Look at it — the whole town, glowing. The kitchen. Papa's hat. Nobody ever looks. Nobody ever LOOKS.",
      8,
    ],
    [
      "pt_vivienne",
      "Every minute of it was the most beautiful thing, and we were all too busy to notice. Goodbye, town. Goodbye, glow.",
      8,
    ],
    [
      "pt_barnaby",
      "Folks don't notice their lives while they're living them. It takes twenty-two years of spare time. We have had the practice.",
      9,
    ],
    [
      "pt_barnaby",
      "That's the end of the play. You can go home now. Mind the raiders on Eighth Avenue. Good night.",
      7,
    ],
  ];
  let show = null;
  P.showRunning = () => !!show; // 85_lighting: the house lights dim while the play runs
  C.setupShow = function () {
    // the company takes places on the stage
    const places = [
      ["pt_barnaby", "stage_c"],
      ["pt_vivienne", "stage_l"],
      ["pt_player1", "stage_r"],
      ["pt_player2", "npc4"],
    ];
    for (const [id, an] of places) {
      const a = actor(id),
        p = A("lyceum_theatre", an);
      if (a && p) {
        a.pos.set(p.x, p.y + 0.05, p.z);
        if (a.char && a.char.root) a.char.root.position.copy(a.pos);
        a.home = { x: p.x, z: p.z, r: 0.6 };
        a.yaw = p.yaw;
      }
    }
  };
  C.startShow = function () {
    if (show) return;
    const seat = A("lyceum_theatre", "seat");
    if (!seat) return;
    C.setupShow();
    show = { t: 0, i: -1, next: 1.5 };
    G.player.teleport(seat.x, seat.y + 0.05, seat.z, 0);
    G.player.frozen = true;
    G.notify(
      "The house lights dim. Somebody in the balcony coughs. The ghost light is carried off.",
    );
    try {
      if (!G.isStub("music")) G.music.setMood("settlement");
    } catch (e) {
      /* */
    }
  };
  function tickShow(dt, realDt) {
    if (!show) return;
    if (G.state !== "play") return;
    show.t += realDt;
    show.next -= realDt;
    if (G.player) {
      G.player.yaw = 0;
      G.player.frozen = true;
    }
    if (show.next > 0) return;
    show.i++;
    if (show.i >= SHOW.length) {
      endShow();
      return;
    }
    const [who, line, dur] = SHOW[show.i];
    const a = actor(who);
    if (a && a.say) a.say(line, dur);
    else G.notify((a && a.name ? a.name : "Actor") + ": " + line);
    show.next = dur;
  }
  function endShow() {
    show = null;
    G.player.frozen = false;
    F.showsSeen++;
    G.notify(
      "The curtain falls. The Lyceum Players take their bows to a house of one — and one is plenty.",
    );
    if (qActive("pt_show")) {
      F.showDone = true;
      if (F.bonusCaps) give("scrip", 100);
      qComplete("pt_show");
      news(
        "Theatre news from the Theater District, would you believe: the Lyceum Players — same company, twenty-two years older — finally opened their play twenty-two years after opening night. Word is the reviews are glowing, and the critic survived.",
      );
    }
    const places = [
      ["pt_barnaby", "director"],
      ["pt_vivienne", "npc1"],
      ["pt_player1", "npc2"],
      ["pt_player2", "npc3"],
    ];
    for (const [id, an] of places) {
      const a = actor(id),
        p = A("lyceum_theatre", an);
      if (a && p) a.home = { x: p.x, z: p.z, r: 1.5 };
    }
  }

  // ------------------------------------------------------------------
  // interactables (seat, locker 417, stage manager's log, ghost light)
  // ------------------------------------------------------------------
  function addInteractables() {
    const W = G.world;
    const seat = A("lyceum_theatre", "seat");
    if (seat)
      W.addInteractable({
        pos: seat.clone().add(new THREE.Vector3(0, 0.6, 0)),
        radius: 0.9,
        label: "Seat of Honour (A-101)",
        verb: () => (show ? "..." : "Sit"),
        priority: 0.6,
        enabled: () =>
          !show && (qStage("pt_show") === "showtime" || qDone("pt_show")),
        onInteract() {
          C.startShow();
        },
      });
    const lk = A("port_authority", "locker417");
    if (lk)
      W.addInteractable({
        pos: lk.clone().add(new THREE.Vector3(0, 0.3, 0.3)),
        radius: 0.6,
        label: "Coin Locker 417",
        verb: () =>
          F.locker ? "Inspect" : has("pt_key_locker417") ? "Unlock" : "Open",
        priority: 0.8,
        locked: () =>
          F.locker ||
          has("pt_key_locker417") ||
          P.lockIsOpen(P.LOCKS.locker417.id)
            ? null
            : "Locked",
        onInteract() {
          if (F.locker) {
            C.openLocker();
            return;
          }
          if (!P.locksLive() && !has("pt_key_locker417")) {
            G.sfx.play("door_locked");
            G.notify("Locker 417 is locked. The key must be somewhere.");
            return;
          }
          P.lockOpen(P.LOCKS.locker417, () => C.openLocker());
        },
      });
    const gl = A("lyceum_theatre", "ghost_light");
    if (gl)
      W.addInteractable({
        pos: gl.clone().add(new THREE.Vector3(0, 1.9, 0)),
        radius: 0.6,
        label: "The Ghost Light",
        verb: "Look",
        onInteract() {
          G.notify(
            'A single bare bulb on a stand. It has not gone out in twenty-two years. Somebody has written on the base: "KEEP IT LIT."',
          );
        },
      });
    const cue = A("ed_sullivan", "stage");
    if (cue)
      W.addInteractable({
        pos: new THREE.Vector3(cue.x + 6.36, cue.y + 1.1, cue.z + 6.7),
        radius: 0.7,
        label: "Cue Cards",
        verb: "Read",
        onInteract() {
          if (!has("pt_note_es_cuecards")) give("pt_note_es_cuecards", 1);
          else
            G.notify(
              '"...AND REMEMBER, FOLKS: THE SAFEST PLACE TO WATCH TOMORROW IS FROM A SHELTER!"',
            );
        },
      });
  }

  // ------------------------------------------------------------------
  // combat spawns: Mr. Showtime (boss) + the stage manager's log on a victim
  // ------------------------------------------------------------------
  P.onRelocated.push((key, a) => {
    if (
      key === "ed_sullivan" &&
      a.type === "valet" &&
      a._ptForced &&
      !a._ptBoss
    ) {
      a._ptBoss = true;
      a.name = "Mr. Showtime";
      a.isBoss = true;
      a.maxHp = Math.round((a.maxHp || 120) * 1.6);
      a.hp = a.maxHp;
      try {
        a.inventory = Array.isArray(a.inventory) ? a.inventory : [];
        a.inventory.push(["pt_note_es_cuecards", 1]);
      } catch (e) {
        /* */
      }
      try {
        a.barks = [
          "Welcome back to THE TOMORROW HOUR!",
          "Please remain seated!",
          "Nobody leaves during a live broadcast!",
          "Let's hear it for the audience!",
        ];
      } catch (e) {
        /* */
      }
    }
    if (key === "ed_sullivan" && a.type === "patrolman" && !a._ptName) {
      a._ptName = true;
      a.name = "Usher Unit";
    }
  });

  // ------------------------------------------------------------------
  // world state from flags
  // ------------------------------------------------------------------
  function applyWorldState() {
    if (P.esOnAir) P.esOnAir.visible = !!F.broadcast;
    if (F.safeReleased) releaseSafe();
  }
  function resetWorld() {
    show = null;
    if (G.player) G.player.frozen = false;
    if (P.esOnAir) P.esOnAir.visible = false;
  }

  // ------------------------------------------------------------------
  // item pick-ups start quests
  // ------------------------------------------------------------------
  G.events.on("itemAdded", (id) => {
    if (
      id === "pt_reel_es_stagemgr" &&
      !qActive("pt_deadair") &&
      !qDone("pt_deadair")
    )
      qStart("pt_deadair", "prep");
    if (id === "pt_es_master_reel") {
      if (!qActive("pt_deadair") && !qDone("pt_deadair"))
        qStart("pt_deadair", "prep");
      checkDeadAir();
    }
    if (
      id === "pt_note_pa_claimcheck" &&
      !qActive("pt_locker417") &&
      !qDone("pt_locker417") &&
      !F.locker
    )
      qStart("pt_locker417", "key");
    if (
      id === "pt_key_locker417" &&
      qActive("pt_locker417") &&
      qStage("pt_locker417") === "key"
    )
      qSet("pt_locker417", "open");
    if (
      (id === "pt_prompt_book" || id === "pt_es_klieg") &&
      !qActive("pt_show") &&
      !qDone("pt_show")
    )
      qStart("pt_show", "talk");
  });

  // ------------------------------------------------------------------
  // lifecycle hooks
  // ------------------------------------------------------------------
  P.onPreReady.push(() => defineItems());
  P.onReady.push(() => {
    defineTerminals();
    defineDialogue();
    defineQuests();
    addInteractables();
  });
  P.onReady.push(() => {
    // the stage manager's log lies with the skeleton in the Ed Sullivan trap room
    const a = A("ed_sullivan", "spawn3b");
    if (a && !G.isStub("items") && G.items.spawnPickup)
      P.safe("pickup:stagemgr", () =>
        G.items.spawnPickup(
          "pt_reel_es_stagemgr",
          1,
          new THREE.Vector3(a.x + 1.2, a.y + 0.02, a.z + 2.2),
          { static: true, keepY: true },
        ),
      );
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnAll();
  });
  P.onReset.push(() => {
    resetWorld();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnAll();
  });
  P.tick.push(tickShow);
})();
