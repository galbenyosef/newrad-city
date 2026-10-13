/* src/poi_harbor/80_content.js */
/* =====================================================================
 * POI_HARBOR — content: items, notes & tape reels, terminals, dialogue,
 * named NPCs (The Registry settlers, bosses, the captive), side quests:
 *   "Huddled Masses" (Registrar Augustine → rescue Nadia Osei from the
 *      Navy Yard Pirates' brig aboard the USS Hudson; the Commodore)
 *   "Sugar Rush" (Doc Tran → the Pure Cane Reserve in the Sugar Works QC lab;
 *      Sweet Tooth, king of the Sugar Works brutes)
 *   "Quarantine" (Registrar → clear the Maniac ward over the Great Hall)
 * Locks (G.locks, PH.regLock): every key / code / passcode is placed in this file or the interior builders.
 * Everything calls other modules at call time and is guarded.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pharbor) return;
  const PH = G._pharbor;
  const A = (poi, name) => PH.getAnchor(poi, name);
  const Q = () => (G.isStub("quests") ? null : G.quests);
  const qActive = (id) => {
    const q = Q();
    try {
      return !!(q && q.isActive && q.isActive(id));
    } catch (e) {
      return false;
    }
  };
  const qDone = (id) => {
    const q = Q();
    try {
      return !!(q && q.isComplete && q.isComplete(id));
    } catch (e) {
      return false;
    }
  };
  const qStage = (id) => {
    const q = Q();
    try {
      return q && q.stage ? q.stage(id) : null;
    } catch (e) {
      return null;
    }
  };
  const qStart = (id) => {
    const q = Q();
    try {
      if (q && q.start) q.start(id);
    } catch (e) {
      /* */
    }
  };
  const qSet = (id, st) => {
    const q = Q();
    try {
      if (q && q.setStage) q.setStage(id, st);
    } catch (e) {
      /* */
    }
  };
  const qComplete = (id) => {
    const q = Q();
    try {
      if (q && q.complete) q.complete(id);
    } catch (e) {
      /* */
    }
  };
  const actor = (id) => {
    try {
      return G.isStub("actors") ? null : G.actors.get(id);
    } catch (e) {
      return null;
    }
  };
  const alive = (id) => {
    const a = actor(id);
    return !!a && !a.dead;
  };
  const pay = (n) => {
    if (PH.scrip() < n) {
      G.notify("You don't have enough scrip.");
      return false;
    }
    PH.addScrip(-n);
    return true;
  };
  const stock = (list) => list.filter((e) => PH.itemExists(e[0]));
  const posOf = (id) => {
    const a = actor(id);
    return a && !a.dead
      ? { x: a.pos.x, z: a.pos.z, y: a.pos.y, label: a.name }
      : null;
  };
  // keys handed over by dialogue (declared for G.locks.audit)
  PH.keyFrom(
    "ph_key_ellis_records",
    'Registrar Augustine — "Huddled Masses" reward',
  );
  PH.keyFrom(
    "ph_key_ward",
    'Registrar Augustine — "Quarantine" (given on accepting)',
  );

  // =====================================================================
  // ITEMS
  // =====================================================================
  function defineItems() {
    if (G.isStub("items") || !G.items.define) return;
    const D = (def) => PH.safe("item " + def.id, () => G.items.define(def));
    D({
      id: "ph_papers",
      name: "Registry Papers",
      type: "note",
      weight: 0,
      value: 0,
      title: "Registry Papers",
      text: "THE REGISTRY — ELLIS ISLAND\nCERTIFICATE OF ARRIVAL No. 4,117\n\nName: (as stated)\nOrigin: (a hole in the ground under Civic Center, apparently)\nCondition: THAWED (sympathies)\n\nThe bearer has been examined, found to be alive, and is hereby welcomed to the Registry. Bearer is entitled to one (1) bowl of soup, the protection of the Hall, and the right to complain about both.\n\n— A. Vell, Registrar",
    });
    D({
      id: "ph_note_quarantine",
      name: "Doc Tran's Ward Notes",
      type: "note",
      weight: 0,
      value: 0,
      title: "Ward Notes — Dormitory C",
      text: "Day 1: Moved Beppe, Old Marta and the Kowalski boy into Dorm C. Pupils fixed, speech slurring. Augustine insists we keep them comfortable. I insist we keep them LOCKED.\nDay 6: Beppe stopped answering to his name. Marta still hums. The boy bit the door.\nDay 11: No more humming.\n\nThey are not them anymore. I have barricaded the door. If anyone opens it, I hope it is someone with a gun and a better stomach than mine. — M.T.",
    });
    D({
      id: "ph_reel_bsi",
      name: "Board of Special Inquiry — Final Session",
      type: "tape",
      weight: 0,
      value: 0,
      title: "BSI Final Session, 03.05.1967",
      text: '[Tape reel. Crackle. A gavel.]\nCHAIR: This Board is in session. Case 1967-0305-44. The Osei family, five persons, arrived from Newark by the 8:10 ferry. [Faint sirens outside, from the Manhattan side. They have been going since half past nine.] We will continue.\nINSPECTOR: Doctor has chalked the grandmother "H", Madam Chair. Heart.\nCHAIR: And the children?\nINSPECTOR: Clean. Scared, but clean.\nCHAIR: Then — [the windows go white. A long, distant boom, from the north. Glass rattles.] — then the Board finds— oh God. Oh God, the windows—\nMEMBER: Admit them. Admit everyone. Open the doors, Harold, OPEN THE—\n[The tape runs another four minutes. No one speaks.]',
    });
    D({
      id: "ph_book_arrivals",
      name: "The Book of Arrivals",
      type: "tape",
      weight: 0.5,
      value: 50,
      title: "The Book of Arrivals (Registry Ledger)",
      text: "THE BOOK OF ARRIVALS — kept by A. Vell, Park Ranger (ret.), Registrar (self-appointed)\n\n1967 — 14 arrivals. All burned. All stayed. I stopped the tours.\n1969 — The first Maniac. One of our own. We learned to lock doors.\n1974 — A child, born here. Ten fingers, ten toes. Her mother cried for a week. So did I.\n1981 — Nadia Osei, the little girl from Case 44, takes over the ferry from her mother.\n1989 — Pirates on the harbor. Took the skiff. Took Nadia.\n\nThey came through here with nothing but a name and a hope. We keep the names. Somebody has to keep the hope.\n\n[Pressed between the entries: a claim ticket for trunk #1892, never collected.]",
    });
    D({
      id: "ph_note_foreman",
      name: "Foreman's Clipboard",
      type: "note",
      weight: 0.5,
      value: 0,
      title: "Night Shift — Brooklyn Sugar Works",
      learn: ["ph_lk_dom_qc_term", "ph_lk_dom_qc_door"],
      text: 'NIGHT SHIFT REPORT — Mar 4, 1967 — Foreman D. Russo\n• Pan 3 boiling over again. Char filters need changing, char filters have needed changing since July.\n• Hudson Valley Foods rep in QC AGAIN asking about "Flake Glaze." I told him we refine sugar, not ordnance. He laughed. I didn\'t.\n• Pure Cane Reserve (Lot 1884, uncut, pre-additive) locked in the QC lab per corporate. "For the shareholders\' Christmas." Swell.\n• QC lab door keypad: 2-2-1-0 this month. QC teletype passcode: CANEFIELD. Do NOT tape them to the door again, Sal.\n• Somebody keeps leaving the silo hatch open. The pigeons are getting fat.',
    });
    D({
      id: "ph_note_sweettooth",
      name: "Sweet Tooth's Rules",
      type: "note",
      weight: 0,
      value: 0,
      title: "SWEET TOOTH RULES (scratched on a Freedom Flakes box)",
      text: "SWEET TOOTH RULES\n1. ALL SUGAR IS SWEET TOOTH SUGAR\n2. TINY HUMANS MAKE GOOD CANDY. DIP IN SYRUP. ROLL IN SUGAR.\n3. NO EAT THE GLOWING SUGAR. MAKE BELLY LOUD.\n4. FLAKES IS GOOD WORD. FREEDOM FLAKES IS BEST WORD.\n5. KEY STAYS ON SWEET TOOTH. KEY OPENS WHITE ROOM. WHITE ROOM HAS BEST SUGAR. NOBODY TOUCH.",
    });
    D({
      id: "ph_reel_captains_log",
      name: "USS Hudson — Captain's Log",
      type: "tape",
      weight: 0,
      value: 0,
      learn: ["ph_lk_hud_eng", "ph_lk_hud_safe"],
      title: "Captain's Log, USS Hudson (BB-68)",
      text: '[Tape reel — Capt. R. Delacroix, USN]\n14 June 1966: Reactivation order received. Twenty-two-year-old battleship, museum volunteers for a crew, a General Atomics "steam plant" bolted where Boiler 3 used to be. Harbor defense, they say. Against the Russians. From a drydock.\n2 Sept 1966: The reactor leaks. GA says it\'s "within tolerance". Tolerance of what, they won\'t say. I have set the engineering teletype to ZEBRA so nobody forgets what condition we are in, and the ship\'s safe to her commissioning year, 1-9-4-4, because I will not remember anything else.\nSunday, 5 Mar 1967, 09:47: Flash to the north, over the Bronx line. Two planes came in over the Sound; one flash. The dock is dry; we are not going anywhere. I have ordered the crew below the armored deck. Fourteen inches of steel. We will see if that is enough.\n[Static.] Day 40: It was enough for the steel. It was not Moscow. The radio says it was Europe. Our own allies. I do not understand anything any more.',
    });
    D({
      id: "ph_note_commodore",
      name: "The Commodore's Orders",
      type: "note",
      weight: 0,
      value: 0,
      learn: "ph_lk_hud_chest",
      title: "STANDING ORDERS — COMMODORE HATCH",
      text: 'STANDING ORDERS OF THE NAVY YARD PIRATES, BY ORDER OF COMMODORE V. HATCH\n1. The Registry skiffs from Ellis run supplies at dawn. Take the skiff. Take the cargo. Take the pilot.\n2. The pilot (Osei) knows the harbor channels. She will teach us, or she will be the figurehead.\n3. Anybody touches the big guns answers to me. They don\'t fire. I checked. Twice.\n4. Magazine key stays on me. The "restricted munitions" are for the Registry if the Registrar keeps saying no.\n5. My sea chest is set to Independence Day, 0-7-0-4, because I am a PATRIOT. Touch it and walk the plank.',
    });
    D({
      id: "ph_key_ellis_records",
      name: "Registrar's Key",
      type: "key",
      weight: 0,
      value: 0,
      desc: "A heavy brass key to the Ellis Island Records Room.",
    });
    D({
      id: "ph_key_ward",
      name: "Ward Key",
      type: "key",
      weight: 0,
      value: 0,
      desc: "A small iron key tied to a strip of red cloth: Dormitory C, the Registry's quarantine ward. Augustine handed it over without looking at it.",
    });
    D({
      id: "ph_key_domino_qc",
      name: "Sticky QC Key",
      type: "key",
      weight: 0,
      value: 0,
      desc: "Opens the Sugar Works' Quality Control lab. Coated in something you hope is syrup.",
    });
    D({
      id: "ph_key_hudson",
      name: "Commodore's Key Ring",
      type: "key",
      weight: 0,
      value: 0,
      desc: "Keys to the USS Hudson's magazine and brig.",
    });
    D({
      id: "ph_key_brig",
      name: "Brig Key",
      type: "key",
      weight: 0,
      value: 0,
      desc: "Opens the cells in the USS Hudson's brig.",
    });
    D({
      id: "ph_sugar_crate",
      name: "Pure Cane Reserve",
      type: "misc",
      weight: 5,
      value: 120,
      quest: true,
      desc: "Lot 1884. A sealed crate of uncut, old-world cane sugar. No Flake Glaze. No radiation. Possibly the purest thing left in New York.",
    });
    // unique apparel & weapons (cloned from existing defs so the weapons module keeps its viewmodels)
    D({
      id: "ph_commodore_hat",
      name: "Commodore's Bicorne",
      type: "apparel",
      slot: "head",
      weight: 1,
      value: 180,
      dr: 4,
      attrs: { presence: 1 },
      desc: "An old-world admiral's dress bicorne, stolen from the Hudson's museum case. Gold braid, moth holes, unearned authority.",
    });
    const base = PH.safe("clone base", () =>
      G.items.get ? G.items.get("lead_pipe") : null,
    );
    if (base && base.weapon) {
      D(
        Object.assign({}, base, {
          id: "ph_candy_cane",
          name: "Sweet Tooth's Candy Cane",
          value: 320,
          unique: true,
          desc: "A length of refinery steam pipe, striped red with paint and something else, and crusted with twenty years of sugar.",
          weapon: Object.assign({}, base.weapon, {
            damage: Math.round((base.weapon.damage || 12) * 1.8),
            critChance: 2,
            skin: base.weapon.skin || "nailed",
          }),
        }),
      );
    }
    const sg = PH.safe("clone sg", () =>
      G.items.get
        ? G.items.get("sawed_off_shotgun") || G.items.get("combat_shotgun")
        : null,
    );
    if (sg && sg.weapon) {
      D(
        Object.assign({}, sg, {
          id: "ph_broadside",
          name: "Broadside",
          value: 750,
          unique: true,
          desc: 'Commodore Hatch\'s double-barrel, engraved "HUDSON — FIRE AS SHE BEARS". Loaded hot.',
          weapon: Object.assign({}, sg.weapon, {
            damage: Math.round((sg.weapon.damage || 40) * 1.3),
            spread: (sg.weapon.spread || 0.1) * 0.85,
          }),
        }),
      );
    }
  }

  // =====================================================================
  // TERMINALS
  // =====================================================================
  function defineTerminals() {
    if (G.isStub("terminals") || !G.terminals.register) return;
    const T = (id, def) =>
      PH.safe("term " + id, () => G.terminals.register(id, def));
    T("ph_ellis_registry", {
      title: "ELLIS ISLAND IMMIGRATION MUSEUM",
      header:
        "NATIONAL PARK SERVICE — KESTREL TELETYPE\nCURATORIAL & VISITOR SERVICES",
      lock: PH.regLock({
        id: "ph_lk_ellis_term",
        label: "Ellis Island Museum Teletype",
        passcode: "THIMBLE",
        hint: "Registrar Augustine still remembers the rangers' old passcode.",
      }),
      entries: [
        {
          title: "Visitor Notice (Mar. 1967)",
          text: "Due to the current international situation, the Immigration Museum will serve as a Federal Emergency Processing Center until further notice. Tours are suspended. The Great Hall will house evacuees from the New Jersey waterfront. Please be patient with our volunteers. They are also frightened.",
        },
        {
          title: "Registry Ledger (excerpt)",
          text: '1988-05  Arrival: "Dutch", skiff-builder, Red Hook. Condition: seasick. Assigned: boathouse.\n1988-08  Arrival: family (3), Staten Island. Fed, sheltered, left for Jersey. Wished them luck. Meant it.\n1989-01  Departure: "Beppe", to Ward C. God keep him.\n1989-03  Nadia Osei failed to return with the dawn skiff. Pirate colours seen off the Navy Yard. Must find someone foolish enough to help.',
        },
        {
          title: "Ranger Vell — Personal",
          text: 'I gave the tour four times a day for two years before the bombs. "Twelve million people passed through this room." I used to say it with a straight face and a practiced catch in the throat.\n\nNow I say it to burned, hungry survivors who come up the stairs with nothing, and the catch in the throat is not practiced.',
        },
        {
          title: ">> Release Records Room lock",
          cond: () => !PH.flag("ellis_records_open"),
          action: () => {
            PH.setFlag("ellis_records_open");
            PH.sfx("door_open");
            G.notify("Records Room lock released.");
          },
        },
      ],
    });
    T("ph_ellis_bsi", {
      title: "BOARD OF SPECIAL INQUIRY",
      header:
        "U.S. IMMIGRATION SERVICE — HEARING RECORDS\nSESSION IN PROGRESS (SINCE 03.05.1967)",
      entries: [
        {
          title: "Docket — 03.05.1967",
          text: '08:30  1967-0305-41  Lindqvist (2) — ADMITTED\n08:52  1967-0305-42  Moretti (1) — ADMITTED (chalk mark "L" disputed)\n09:15  1967-0305-43  Ferreira (4) — ADMITTED\n09:38  1967-0305-44  Osei (5) — [RULING NOT ENTERED]',
        },
        {
          title: "Chair's Note",
          text: 'We are told we are "the gate". We decide who is fit to be American. Most days I think the question is backwards. The people climbing those stairs have crossed an ocean; the question is whether WE are fit to receive them.',
        },
        {
          title: "Case 1967-0305-44 — Addendum (1988)",
          text: "[Added in a different hand, years later.]\nRuling: ADMITTED. All of them. The little one, Nadia, runs the ferry now.\n— A. Vell, for the Board",
        },
      ],
    });
    T("ph_domino_ops", {
      title: "BROOKLYN SUGAR WORKS — PLANT OPERATIONS",
      header:
        'PLANT OPERATIONS TELETYPE — BOILER HOUSE\n"A BRIGHTER TOMORROW, ONE CUBE AT A TIME"',
      entries: [
        {
          title: "Boiler Status",
          text: () =>
            "BOILER 1: COLD\nBOILER 2: COLD\nBOILER 3: PRESSURE ANOMALY — relief joints venting intermittently" +
            (PH.flag("domino_vents_off")
              ? "\n\n[MANUAL BLOWDOWN COMPLETE — LINES DEPRESSURIZED]"
              : "\n\nRECOMMEND: MANUAL BLOWDOWN"),
        },
        {
          title: 'Memo: "Freedom Flakes" Contract',
          text: 'To all shifts: Hudson Valley Foods has renewed the Freedom Flakes contract for 1968. Additive line 4 ("Flake Glaze", supplied sealed, DO NOT OPEN) will run double shifts. Management reminds staff that the dust is "perfectly safe" and that any glowing in the break room is "a lighting issue."',
        },
        {
          title: "Pigeon Complaint #212",
          text: "The silo pigeons have been eating the additive spill and are now the size of cats. They are aggressive. One of them took Sal's lunch AND Sal's thermos. Requesting a man with a shotgun.",
        },
        {
          title: ">> Manual blowdown (vent steam lines)",
          cond: () => !PH.flag("domino_vents_off"),
          action: () => {
            PH.setFlag("domino_vents_off");
            PH.sfx("fire_loop");
            G.notify(
              "The boiler house shrieks, then goes quiet. The steam lines are depressurized.",
            );
            PH.xp(15, "Plant operations");
          },
        },
      ],
    });
    T("ph_domino_qc", {
      title: "QUALITY CONTROL — LAB 2",
      header:
        'FREEDOM FLAKES — QC TELETYPE\nPOLARIMETRY / ASH / COLOR / "ADDITIVE COMPLIANCE"',
      lock: PH.regLock({
        id: "ph_lk_dom_qc_term",
        label: "QC Teletype",
        passcode: "CANEFIELD",
        hint: "Foreman Russo's night-shift clipboard in the warehouse lists the QC passcode.",
      }),
      entries: [
        {
          title: "Batch 67-0222 Report",
          text: 'Polarization: 99.9° — excellent.\nAsh: 0.01% — excellent.\nAdditive compliance ("Flake Glaze"): 9.0% — per spec.\nGeiger reading of finished product: 0.4 rad/hr — "per spec" (spec amended 02/1967).',
        },
        {
          title: "Pure Cane Reserve",
          text: "Lot 1884 (\"Founder's Reserve\") — uncut, pre-additive cane sugar, sealed in 1966 for the centennial display. Stored: QC lab, north corner. Do NOT process. Do NOT let R&D near it.\n\nP.S. The QC petty-cash safe is set to the lot number, 1-8-8-4, at Mr. Russo's request. He says he cannot remember anything else.",
          learn: "ph_lk_dom_qc_safe",
        },
        {
          title: "R&D Memo (Confidential)",
          text: 'Re: longevity trials. Test subjects fed exclusively on Formula 7 for 90 days report "incredible energy" and "a humming in the teeth." We recommend the product for the military ration contract. We recommend further study. We recommend nobody at this company eat it.',
        },
      ],
    });
    T("ph_hudson_engineering", {
      title: "USS HUDSON — ENGINEERING",
      header:
        "GENERAL ATOMICS MARINE DIVISION\nATOMIC STEAM PLANT MK.II — CONTROL",
      lock: PH.regLock({
        id: "ph_lk_hud_eng",
        label: "Hudson Engineering Teletype",
        passcode: "ZEBRA",
        hint: "The captain's log reel in his cabin names the engineering passcode.",
      }),
      entries: [
        {
          title: "Plant Status",
          text: () =>
            "REACTOR: " +
            (PH.flag("hudson_scram")
              ? "SCRAMMED (SUBCRITICAL)"
              : "IDLE — COOLANT LOSS 31%, PRIMARY LEAK DETECTED") +
            "\nSHAFT POWER: 0 SHP\nDRYDOCK INTERLOCK: ENGAGED",
        },
        {
          title: "Refit Memo (1966)",
          text: "The Navy wanted a battleship in New York Harbor by spring. We had a museum and a prototype reactor that failed its sea trials. Problem solved. Tolerances have been adjusted to reflect operational realities.",
        },
        {
          title: "Pirate Graffiti (typed)",
          text: "THE GLOWY TANK MAKES YOUR HAIR FALL OUT. DO NOT NAP IN ENGINE ROOM. — MGMT (KEGS)",
        },
        {
          title: ">> SCRAM reactor (insert control rods)",
          cond: () => !PH.flag("hudson_scram"),
          action: () => {
            PH.setFlag("hudson_scram");
            PH.applyScram();
            G.notify(
              "Control rods drop with a boom you feel in your fillings. The engine room's glow fades.",
            );
            PH.xp(25, "Reactor SCRAM");
          },
        },
      ],
    });
    T("ph_hudson_radio", {
      title: "USS HUDSON — RADIO CENTRAL",
      header:
        "NAVAL COMMUNICATIONS — TELETYPE RELAY\nFLEET BROADCAST: NO CARRIER",
      entries: [
        {
          title: "Last Traffic (03.05.1967)",
          text: "0941 FROM COMNAVEAST: ALL UNITS CONDITION ZEBRA.\n0943 FROM COMNAVEAST: ALL UNITS\n0943 FROM COMNAVEAST: \n[Nothing further for 22 years.]",
        },
        {
          title: "Pirate Radio Scripts",
          text: '"This is the Commodore, broadcasting from the mighty Hudson! Ellis Islanders, your skiffs are ours, your harbor is ours, and your Registrar still owes me an apology. Pirates: rum ration is canceled. We don\'t have rum. Carry on."',
        },
        {
          title: "Intercept: Registry Skiff Schedule",
          text: 'ELLIS → BATTERY: dawn, pilot OSEI. Cargo: soup (?), medicine, "books". Escort: none. — (in grease pencil) EASY PICKINGS',
        },
      ],
    });
  }

  // =====================================================================
  // DIALOGUE
  // =====================================================================
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
  function defineQuests() {
    const q = Q();
    if (!q || !q.define) return;
    const D = (def) => PH.safe("quest " + def.id, () => q.define(def));
    const ellisDesk = () => {
      const a = posOf("ph_augustine");
      if (a) return [Object.assign(a, { label: "Registrar Augustine" })];
      const v = A("ellis_island", "registrar");
      return v
        ? [{ x: v.x, z: v.z, y: v.y, label: "Registrar Augustine" }]
        : [];
    };
    D({
      id: "ph_q_huddled",
      name: "Huddled Masses",
      giver: "Registrar Augustine Vell",
      location: "Ellis Island",
      desc: "The Navy Yard Pirates seized The Registry's supply skiff and its pilot, Nadia Osei. Registrar Augustine Vell wants her brought home from the pirate battleship USS Hudson.",
      stages: [
        {
          id: "board",
          text: "Find Nadia Osei aboard the USS Hudson in the Brooklyn Navy Yard drydock.",
          markers: () => {
            const v = A("uss_hudson", "captive");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "USS Hudson — Brig" }]
              : [];
          },
        },
        {
          id: "hm_commodore",
          text: "(Optional) Deal with Commodore Hatch on the Hudson's bridge.",
          sideObjective: true,
          optional: true,
          showIf: () => !PH.flag("commodore_dead") && !qDone("ph_q_huddled"),
          doneIf: () => !!PH.flag("commodore_dead"),
          markers: () => {
            const v = A("uss_hudson", "boss");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "Commodore Hatch" }]
              : [];
          },
        },
        {
          id: "return",
          text: "Nadia is free. Return to Registrar Augustine at Ellis Island.",
          markers: ellisDesk,
        },
      ],
      rewards: { xp: 350, scrip: 150, standing: 40 },
    });
    D({
      id: "ph_q_sugar",
      name: "Sugar Rush",
      giver: "Doc Minh Tran",
      location: "Brooklyn Sugar Works",
      desc: "Doc Tran of The Registry needs uncontaminated old-world cane sugar to keep her ageing, radiation-sick patients from losing their minds and turning Maniac. A sealed \"Founder's Reserve\" should still be in the Brooklyn Sugar Works' Quality Control lab — now a brute den.",
      stages: [
        {
          id: "find",
          text: "Recover the Pure Cane Reserve from the Brooklyn Sugar Works' Quality Control lab.",
          markers: () => {
            const v = A("domino_sugar", "qc_crate");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "Pure Cane Reserve" }]
              : [];
          },
        },
        {
          id: "sr_key",
          text: "(Optional) Take the QC lab key from Sweet Tooth.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !PH.hasItem("ph_sugar_crate") && !PH.flag("domino_qc_open"),
          doneIf: () =>
            PH.hasItem("ph_key_domino_qc") || !!PH.flag("domino_qc_open"),
          markers: () => {
            const p = posOf("ph_sweet_tooth") || A("domino_sugar", "boss");
            return p ? [{ x: p.x, z: p.z, y: p.y, label: "Sweet Tooth" }] : [];
          },
        },
        {
          id: "return",
          text: "Bring the Pure Cane Reserve to Doc Tran at Ellis Island.",
          markers: () => {
            const a = posOf("ph_doc_tran") || A("ellis_island", "doctor");
            return a ? [{ x: a.x, z: a.z, y: a.y, label: "Doc Tran" }] : [];
          },
        },
      ],
      rewards: {
        xp: 300,
        scrip: 120,
        items: [
          [PH.item("rally_tonic_extra", "rally_tonic") || "rally_tonic", 2],
        ],
      },
    });
    D({
      id: "ph_q_quarantine",
      name: "Quarantine",
      giver: "Registrar Augustine Vell",
      location: "Ellis Island",
      desc: "Three Registry residents lost their minds to radiation sickness and were barricaded into Dormitory C above the Great Hall. The Registrar asks for a merciful end.",
      stages: [
        {
          id: "clear",
          text: "Clear the Maniacs from the quarantine ward (Dormitory C).",
          markers: () => {
            const v = A("ellis_island", "quarantine");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "Quarantine Ward" }]
              : [];
          },
        },
        {
          id: "report",
          text: "Tell Registrar Augustine the ward is clear.",
          markers: ellisDesk,
        },
      ],
      rewards: {
        xp: 150,
        scrip: 75,
        items: [[PH.item("ammo_10mm") || "scrip", 24]],
      },
    });
  }

  // =====================================================================
  // NPCs (spawned per game, deferred one frame after newGame / load)
  // =====================================================================
  const OUT = (poi, name, dx, dz) => {
    const v = A(poi, name);
    return v
      ? { x: v.x + (dx || 0), y: v.y, z: v.z + (dz || 0), yaw: v.yaw || 0 }
      : null;
  };
  function spawn(def) {
    if (G.isStub("actors") || !G.actors.spawn) return null;
    const ex = actor(def.id);
    if (ex && !ex.removed && !ex._removed) return ex;
    if (!def.pos) return null;
    const d = Object.assign({}, def);
    if (d.merchant && d.merchant.stock)
      d.merchant = Object.assign({}, d.merchant, {
        stock: stock(d.merchant.stock),
      });
    if (d.inventory) d.inventory = stock(d.inventory);
    if (d.weapon && !PH.itemExists(d.weapon)) delete d.weapon;
    const a = PH.safe("spawn " + def.id, () => G.actors.spawn(d));
    if (a && def.pos.yaw !== undefined) a.yaw = def.pos.yaw;
    return a;
  }
  const home = (p, r) => (p ? { x: p.x, z: p.z, r: r || 3 } : undefined);
  function spawnEllis() {
    const P = (n, dx, dz) => OUT("ellis_island", n, dx, dz);
    const townsfolk = {
      type: "human",
      outfit: "survivor_layers",
      faction: "settlers",
      hostile: false,
    };
    let p;
    p = P("registrar");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_augustine",
          name: "Registrar Augustine Vell",
          outfit: "merchant",
          gender: "m",
          pos: p,
          ai: "guard",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_augustine",
          level: 8,
          barks: [
            "Next! Step up to the desk.",
            "Twelve million people. And now, you.",
            "Everyone gets registered. Everyone gets soup.",
          ],
        }),
      );
    p = P("merchant");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_tomas",
          name: 'Tomas "Customs" Kowalczyk',
          outfit: "merchant",
          gender: "m",
          pos: p,
          ai: "merchant",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_tomas",
          merchant: {
            scrip: 450,
            restock: 3,
            stock: [
              ["rally_tonic", 3],
              ["prussian_blue", 2],
              ["iodine_tabs", 2],
              ["purified_water", 4],
              ["ammo_10mm", 60],
              ["ammo_12ga", 24],
              ["ammo_308", 20],
              ["pistol_10mm", 1],
              ["hunting_rifle", 1],
              ["sawed_off_shotgun", 1],
              ["leather_armor", 1],
              ["metal_armor", 1],
              ["frag_grenade", 3],
              ["scrap_metal", 5],
              ["fizzo_cola", 3],
            ],
          },
          barks: [
            "Declare your goods! Kidding.",
            "Harbor salvage, fresh off the seabed!",
          ],
        }),
      );
    p = P("doctor");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_doc_tran",
          name: "Doc Minh Tran",
          outfit: "doctor",
          gender: "f",
          pos: p,
          ai: "merchant",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_doc",
          merchant: {
            scrip: 350,
            restock: 3,
            stock: [
              ["rally_tonic", 6],
              ["rally_tonic_extra", 1],
              ["prussian_blue", 4],
              ["iodine_tabs", 3],
              ["morphine_syrette", 1],
              ["field_surgery_kit", 1],
              ["purified_water", 3],
            ],
          },
          barks: [
            "Next patient.",
            "If it hurts, don't do that.",
            "Keep your fingers where I can see them. All of them.",
          ],
        }),
      );
    p = P("cook");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_rosaria",
          name: "Mama Rosaria",
          outfit: "settler",
          gender: "f",
          pos: p,
          ai: "merchant",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_rosaria",
          merchant: {
            scrip: 150,
            restock: 2,
            stock: [
              ["shellback_chowder", 3],
              ["shellback_cakes", 3],
              ["golden_plain_jerky", 2],
              ["franks_and_beans", 2],
              ["purified_water", 4],
              ["dirty_water", 4],
              ["beer", 2],
            ],
          },
          barks: ["Soup! Five scrip! Love is free!", "You call that eating?"],
        }),
      );
    p = P("porter");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_sal",
          name: "Porter Sal",
          outfit: "settler",
          gender: "m",
          pos: p,
          ai: "guard",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_sal",
          barks: [
            "Baggage check!",
            "Claim ticket? No? Nobody ever has the ticket.",
          ],
        }),
      );
    const gp1 = P("guard1"),
      gp2 = P("guard2");
    if (gp1)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_guard1",
          name: "Registry Guard",
          outfit: "leather_armor",
          gender: "m",
          pos: gp1,
          ai: "guard",
          home: home(gp1, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "hunting_rifle",
          level: 7,
          barks: ["Welcome to the Registry. Keep it holstered."],
        }),
      );
    if (gp2)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_guard2",
          name: "Registry Guard",
          outfit: "combat_armor",
          gender: "f",
          pos: gp2,
          ai: "guard",
          home: home(gp2, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "pistol_10mm",
          level: 7,
          barks: ["Papers? Kidding. Mostly."],
        }),
      );
    const gg1 = P("gate1"),
      gg2 = P("gate2");
    if (gg1)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_gate1",
          name: "Registry Gatekeeper",
          outfit: "combat_armor",
          gender: "m",
          pos: gg1,
          ai: "guard",
          home: home(gg1, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "hunting_rifle",
          level: 8,
          barks: [
            "Welcome to America. Again.",
            "Registrar's upstairs. Mind the stairs, they're older than me.",
          ],
        }),
      );
    if (gg2)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_gate2",
          name: "Registry Gatekeeper",
          outfit: "leather_armor",
          gender: "f",
          pos: gg2,
          ai: "guard",
          home: home(gg2, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "pistol_10mm",
          level: 8,
          barks: ["Keep your weapon down on the island."],
        }),
      );
    const names = [
      "Old Tom",
      "Greta Lindqvist",
      "Inga Lindqvist",
      "Dutch",
      "Moss",
      "Father Pat",
    ];
    ["npc1", "npc2", "npc3", "npc4", "npc5", "npc6"].forEach((n, i) => {
      const pp = P(n);
      if (!pp) return;
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_res" + i,
          name: names[i],
          outfit: i % 2 ? "settler" : "survivor_layers",
          gender: i % 3 ? "f" : "m",
          pos: pp,
          ai: "wander",
          home: home(pp, 5),
          dialogue: "ph_dlg_resident",
          level: 4,
        }),
      );
    });
    // Nadia at home (after the rescue)
    if (PH.flag("nadia_freed")) {
      const np = P("npc7");
      if (np) {
        PH.setFlag("nadia_home");
        spawn(
          Object.assign({}, townsfolk, {
            id: "ph_nadia",
            name: "Nadia Osei",
            outfit: "settler",
            gender: "f",
            pos: np,
            ai: "guard",
            home: home(np, 3),
            essential: true,
            dialogue: "ph_dlg_nadia",
            barks: ["Dawn run leaves at six. Don't be late."],
          }),
        );
      }
    }
    // the quarantine ward's Maniacs
    if (!PH.flag("quarantine_cleared"))
      ["maniac1", "maniac2", "maniac3"].forEach((n, i) => {
        const fp = P(n);
        if (!fp) return;
        spawn({
          id: "ph_ellis_maniac" + i,
          type: "maniac",
          name: ["Beppe", "Old Marta", "The Kowalski Boy"][i],
          faction: "maniacs",
          hostile: true,
          level: 6,
          pos: fp,
          ai: "guard",
          home: home(fp, 4),
          noRespawn: true,
        });
      });
  }
  function spawnDomino() {
    const P = (n, dx, dz) => OUT("domino_sugar", n, dx, dz);
    let p = P("boss");
    if (p)
      spawn({
        id: "ph_sweet_tooth",
        type: "brute",
        name: "Sweet Tooth",
        faction: "brutes",
        hostile: true,
        level: 12,
        hp: 420,
        dr: 12,
        pos: p,
        ai: "guard",
        home: home(p, 7),
        noRespawn: true,
        inventory: [
          ["ph_key_domino_qc", 1],
          ["ph_candy_cane", 1],
          ["freedom_flakes", 4],
          ["scrip", 85],
        ],
        barks: [
          "TINY HUMAN! TINY HUMAN IS CANDY!",
          "SWEET TOOTH WANTS A TREAT!",
          "DIP IN SYRUP! ROLL IN SUGAR!",
          "NO TOUCH SWEET TOOTH SUGAR!",
        ],
      });
    p = P("spawn4");
    if (p)
      spawn({
        id: "ph_dom_gumdrop",
        type: "brute",
        name: "Gumdrop",
        faction: "brutes",
        hostile: true,
        level: 9,
        pos: p,
        ai: "guard",
        home: home(p, 6),
        noRespawn: true,
        barks: ["Gumdrop hear you.", "Tiny human. Tiny snack."],
      });
    p = P("spawn6");
    if (p)
      spawn({
        id: "ph_dom_taffy",
        type: "brute",
        name: "Taffy",
        faction: "brutes",
        hostile: true,
        level: 9,
        pos: p,
        ai: "wander",
        home: home(p, 8),
        noRespawn: true,
        barks: ["Boiler warm. Taffy warm. Human warm soon."],
      });
    // the yard camp outside (the refinery's welcoming committee)
    p = P("spawn_out1");
    if (p)
      spawn({
        id: "ph_dom_yard1",
        type: "brute",
        name: "Lollipop",
        faction: "brutes",
        hostile: true,
        level: 8,
        pos: p,
        ai: "guard",
        home: home(p, 9),
        noRespawn: true,
        barks: [
          "TINY HUMAN COME TO CANDY FACTORY!",
          "Lollipop hungry. Lollipop ALWAYS hungry.",
        ],
      });
    p = P("spawn_out2");
    if (p)
      spawn({
        id: "ph_dom_yard2",
        type: "brute",
        name: "Butterscotch",
        faction: "brutes",
        hostile: true,
        level: 8,
        pos: p,
        ai: "wander",
        home: home(p, 10),
        noRespawn: true,
        barks: ["Butterscotch smell tiny human.", "FREEDOM! FLAKES!"],
      });
    // the Pure Cane Reserve (quest item)
    if (
      !qDone("ph_q_sugar") &&
      !PH.hasItem("ph_sugar_crate") &&
      !PH.flag("sugar_taken")
    ) {
      const c = A("domino_sugar", "qc_crate");
      if (c)
        PH.pickup("ph_sugar_crate", 1, PH.v3(c.x, c.y + 0.05, c.z), {
          noSave: true,
        });
    }
  }
  function spawnHudson() {
    const P = (n, dx, dz) => OUT("uss_hudson", n, dx, dz);
    let p = P("boss");
    if (p)
      spawn({
        id: "ph_commodore",
        type: "raider",
        outfit: "raider_heavy",
        name: "Commodore Hatch",
        faction: "raiders",
        hostile: true,
        level: 13,
        hp: 380,
        dr: 14,
        pos: p,
        ai: "guard",
        home: home(p, 5),
        noRespawn: true,
        weapon: PH.item("ph_broadside", "combat_shotgun", "sawed_off_shotgun"),
        inventory: [
          ["ph_key_hudson", 1],
          ["ph_commodore_hat", 1],
          ["scrip", 160],
          [PH.item("ammo_12ga") || "scrip", 16],
        ],
        barks: [
          "All hands! Repel boarders!",
          "You're standing on MY bridge!",
          "I am the Commodore of this harbor!",
          "Fire as she bears!",
        ],
      });
    p = P("brig_guard");
    if (p)
      spawn({
        id: "ph_brig_sentry",
        type: "raider",
        name: "Brig Sentry",
        faction: "raiders",
        hostile: true,
        level: 9,
        pos: p,
        ai: "guard",
        home: home(p, 3),
        noRespawn: true,
        inventory: [["ph_key_brig", 1]],
        barks: ["Nobody talks to the prisoner!"],
      });
    p = P("mess", 2, 3);
    if (p)
      spawn({
        id: "ph_bosun_kegs",
        type: "raider",
        name: "Bosun Kegs",
        faction: "raiders",
        hostile: true,
        level: 11,
        pos: p,
        ai: "guard",
        home: home(p, 6),
        noRespawn: true,
        barks: ["Mess hall's closed!", "Kegs is gonna keg you!"],
      });
    p = P("cic");
    if (p)
      spawn({
        id: "ph_hudson_lookout",
        type: "raider",
        name: "Pirate Lookout",
        faction: "raiders",
        hostile: true,
        level: 9,
        pos: p,
        ai: "guard",
        home: home(p, 4),
        noRespawn: true,
      });
    // topside watch: gangway sentry & a deckhand by the scrap wall
    p = P("gangway");
    if (p)
      spawn({
        id: "ph_hudson_gangway",
        type: "raider",
        name: "Gangway Sentry",
        faction: "raiders",
        hostile: true,
        level: 8,
        pos: p,
        ai: "guard",
        home: home(p, 4),
        noRespawn: true,
        barks: [
          "Permission to come aboard: DENIED!",
          "Toll's everything you own, landlubber!",
        ],
      });
    p = P("deck");
    if (p)
      spawn({
        id: "ph_hudson_deckhand",
        type: "raider",
        name: "Pirate Deckhand",
        faction: "raiders",
        hostile: true,
        level: 8,
        pos: p,
        ai: "guard",
        home: home(p, 6),
        noRespawn: true,
        barks: ["Boarders! Boarders on the starboard side!", "All hands!"],
      });
    if (!PH.flag("nadia_freed")) {
      p = P("captive");
      if (p)
        spawn({
          id: "ph_nadia",
          type: "human",
          outfit: "settler",
          gender: "f",
          name: "Nadia Osei",
          faction: "settlers",
          hostile: false,
          essential: true,
          pos: p,
          ai: "static",
          home: home(p, 1),
          dialogue: "ph_dlg_nadia",
          barks: [
            "Somebody out there? HEY!",
            "Commodore's a jumped-up bilge rat.",
          ],
        });
    }
  }
  /** Free Nadia: she slips away (removed here, reappears in the Registry). */
  PH.freeNadia = function () {
    PH.setFlag("nadia_freed");
    if (qActive("ph_q_huddled")) qSet("ph_q_huddled", "return");
    PH.xp(50, "Freed Nadia Osei");
    PH.later(3.0, () => {
      const a = actor("ph_nadia");
      if (a && a.pos.x > 6000 && a.pos.z > 600) {
        try {
          G.actors.remove(a);
        } catch (e) {
          /* */
        }
      }
    });
  };
  PH.applyScram = function () {
    if (PH._reactorRad) PH._reactorRad.strength = 0.25;
  };

  // tiny dt-driven scheduler (pauses with menus)
  const pending = [];
  PH.later = (sec, fn) => pending.push({ t: sec, fn });
  PH.updaters.push(function (dt) {
    for (let i = pending.length - 1; i >= 0; i--) {
      pending[i].t -= dt || 0;
      if (pending[i].t <= 0) {
        const p = pending.splice(i, 1)[0];
        PH.safe("later", p.fn);
      }
    }
  });

  // =====================================================================
  // STATIC PICKUPS (notes, loot) — spawned once at initDone, rpg remembers them
  // =====================================================================
  function staticPickups() {
    if (G.isStub("items") || !G.items.spawnPickup) return;
    const S = (id, n, poi, anchor, dx, dy, dz) => {
      const v = A(poi, anchor);
      if (!v || !PH.itemExists(id)) return;
      PH.safe("pickup " + id, () =>
        G.items.spawnPickup(
          id,
          n,
          PH.v3(v.x + (dx || 0), v.y + (dy || 0), v.z + (dz || 0)),
          { static: true },
        ),
      );
    };
    S("ph_note_quarantine", 1, "ellis_island", "quarantine", -2, 0.02, 1.4);
    S("ph_reel_bsi", 1, "ellis_island", "inquiry", 0.6, 1.57, 4.3);
    S("ph_book_arrivals", 1, "ellis_island", "records", 1.2, 0.02, 1.5);
    S("rally_tonic", 1, "ellis_island", "surgery", 1.5, 0.9, 0);
    S("ph_note_foreman", 1, "domino_sugar", "spawn1", -3, 0.02, -8);
    S("ph_note_sweettooth", 1, "domino_sugar", "boss", 2.4, 0.02, 1.0);
    S("freedom_flakes", 2, "domino_sugar", "boss", -1.5, 0.02, 0.6);
    S("fizzo_blue", 1, "domino_sugar", "qc", 6, 0.97, -5);
    S("ph_reel_captains_log", 1, "uss_hudson", "captain_desk", 0.3, 0.02, 0);
    S("ph_note_commodore", 1, "uss_hudson", "bridge", -7.5, 0.97, -1.9);
    S(
      PH.item("ammo_recoilless") || "frag_grenade",
      1,
      "uss_hudson",
      "mag_loot",
      1.2,
      1.32,
      -1.2,
    );
    S(
      PH.item("missile_launcher") || "hunting_rifle",
      1,
      "uss_hudson",
      "mag_loot",
      1.4,
      1.32,
      0.8,
    );
    S("ammo_missile", 2, "uss_hudson", "mag_loot", 1.0, 1.32, 0);
  }

  // =====================================================================
  // Lifecycle
  // =====================================================================
  let spawnPending = false,
    maintT = 0;
  PH.onReady.unshift(function () {
    defineItems();
    defineTerminals();
    defineDialogue();
    defineQuests();
  });
  PH.onReady.push(staticPickups);
  PH.onNewGame.push(() => {
    spawnPending = true;
  });
  PH.onLoaded.push(() => {
    spawnPending = true;
  });
  PH.onReset.push(() => {
    pending.length = 0;
  });
  PH.updaters.push(function (dt, realDt) {
    if (
      spawnPending &&
      (G.state === "play" || G.state === "loading" || G.worldRunning())
    ) {
      spawnPending = false;
      PH.safe("spawnEllis", spawnEllis);
      PH.safe("spawnDomino", spawnDomino);
      PH.safe("spawnHudson", spawnHudson);
    }
    maintT -= realDt || 0;
    if (maintT > 0) return;
    maintT = 1.0;
    // quest bookkeeping
    if (
      !PH.flag("quarantine_cleared") &&
      [0, 1, 2].every((i) => {
        const a = actor("ph_ellis_maniac" + i);
        return !a || a.dead;
      }) &&
      PH.flag("ellis_quarantine_open")
    ) {
      PH.setFlag("quarantine_cleared");
      if (qActive("ph_q_quarantine")) qSet("ph_q_quarantine", "report");
    }
    if (
      qActive("ph_q_sugar") &&
      PH.hasItem("ph_sugar_crate") &&
      qStage("ph_q_sugar") !== "return"
    )
      qSet("ph_q_sugar", "return");
    if (
      PH.flag("nadia_freed") &&
      !PH.flag("nadia_home") &&
      Math.abs(G.player.pos.x - 6600) < 170 &&
      Math.abs(G.player.pos.z) < 170
    )
      spawnEllis();
    // Nadia may be freed before the quest was ever given
    if (
      qActive("ph_q_huddled") &&
      PH.flag("nadia_freed") &&
      qStage("ph_q_huddled") === "board"
    )
      qSet("ph_q_huddled", "return");
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !a.id) return;
    if (a.id === "ph_sweet_tooth") {
      PH.setFlag("sweettooth_dead");
      PH.xp(80, "Sweet Tooth");
      try {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "Word from Williamsburg: the brute they called Sweet Tooth has eaten his last bowl of Freedom Flakes.",
          );
      } catch (e) {
        /* */
      }
    }
    if (a.id === "ph_commodore") {
      PH.setFlag("commodore_dead");
      try {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "The Navy Yard Pirates are looking for a new Commodore. Applicants should note the job has a short life expectancy.",
          );
      } catch (e) {
        /* */
      }
    }
  });
  G.events.on("itemAdded", (id) => {
    if (id === "ph_sugar_crate") {
      PH.setFlag("sugar_taken");
      if (qActive("ph_q_sugar")) qSet("ph_q_sugar", "return");
    }
  });
  G.events.on("phCellOpened", () => {
    /* Nadia can now be talked to (her dialogue switches to "freed") */
  });
  // reactor rad source handle (so SCRAM can weaken it)
  PH.onReady.push(() => {
    const O = G.LAYOUT.INTERIORS.uss_hudson.origin;
    const list = (G.world && G.world.radSources) || [];
    PH._reactorRad =
      list.find(
        (s) => Math.abs(s.x - (O.x - 9)) < 0.5 && Math.abs(s.z - O.z) < 0.5,
      ) || null;
    if (PH._reactorRad && PH.flag("hudson_scram")) PH.applyScram();
  });
  PH.onLoaded.push(() => {
    if (PH._reactorRad)
      PH._reactorRad.strength = PH.flag("hudson_scram") ? 0.25 : 4;
  });
  PH.onReset.push(() => {
    if (PH._reactorRad) PH._reactorRad.strength = 4;
  });
  // steam vents respect the blowdown
  PH.updaters.push(() => {
    if (PH.domVents && PH.flag("domino_vents_off"))
      for (const v of PH.domVents) {
        v.t = 999;
        v.burst = 0;
      }
    else if (PH.domVents) for (const v of PH.domVents) if (v.t > 100) v.t = 2;
  });
})();
