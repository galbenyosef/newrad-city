// play-inline-222 02 — the
// Lines 18-290 of readable/play-inline-222.pretty.js (statement-aligned).
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
