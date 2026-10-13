/* src/quests/60_finale.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 60: LIBERTY (ACT IV "GIVE ME LIBERTY")
 *   n24 mq06 "Give Me Liberty"      — land, get into the star fort and the
 *                                     pedestal, reach the command post (the 1968
 *                                     wanted poster: THE MATCH WOMAN)
 *   n25 mq25 "The Colonel"          — Colonel Augustus Crane: talk down, the
 *                                     rolls argument, fight, or stand with him;
 *                                     shield Rose's identity
 *   n26 mq26 "Prisoners of Liberty" — free Zeke and Dr. Calloway (her testimony:
 *                                     a woman knocks for pod seven every February
 *                                     — Nicole is alive, Rose lied); the evidence
 *                                     locker and Key B
 *   n27 mq27 "Who Gave the Order"   — Crane's safe: FILE 67-03-05
 *   n28 mq28 "The Torch"            — program the Knickerbocker Array; it fires
 *                                     at noon on Sunday (Overload: now)
 * The crossing (mq24) is in 64_ms_act3.js; it calls L.ms.liberty.arrive(how).
 * The old mq06 ending slideshow is gone: endings belong to the finale (mq36,
 * src/lair). Its world slides survive as L.ms.worldSlides() for the finale's
 * epilogue. The Array's consequences (sky) are applied at "noon Sunday": when
 * mq36 completes, or when the finale calls L.ms.fireArray().
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const ms = () => L.ms;
  const hero = () => L.heroName();
  const first = () => String(hero()).split(" ")[0];
  const lastName = () => String(hero()).split(" ").pop();
  const volunteer = () => "Volunteer " + lastName();
  const faction = () => L.flag("mq_faction") || "none"; // 'covenant' | 'continuity' | 'none'
  const LIB = () => G.LAYOUT.LIBERTY;
  const at = (id, s) => Q.isActive(id) && Q.stage(id) === s;
  const roseHere = () =>
    !!L.flag("ms_rose_on_liberty") && !L.flag("ms_rose_left_liberty");
  const roseName = () => (ms() ? ms().roseName() : "Rose");

  const SH = {
    conFaction: "continuity",
    covFaction: "covenant",
    conRig: "continuity_exo_rig",
    covRig: "covenant_exo_rig",
    conSoldier: "continuity_soldier",
    cryoSuit: "cryo_suit",
    sleeperFaction: "cryo",
    skyEyeType: "sky_eye",
    gyroCarbine: "gyrojet_carbine",
    rotaryCannon: "minigun",
    doomedFactions: ["maniacs", "brutes"],
    neonZone: "times_square",
    neonFaction: "settlers",
  };
  const DOOMED_TYPE_RE = /maniac|brute|colossus/;
  const isSkyEye = (a) =>
    a && (a.type === SH.skyEyeType || /sky_?eye/.test(String(a.type || "")));
  // The Neon refused the 1967 enrolment: its townsfolk are the first the Selective field takes.
  const inNeon = (a) => {
    if (!a.pos || !G.combat || !G.combat.safeZoneAt) return false;
    try {
      const z = G.combat.safeZoneAt(a.pos.x, a.pos.z);
      return !!z && (z === SH.neonZone || z.id === SH.neonZone);
    } catch (e) {
      return false;
    }
  };
  const isNeonFolk = (a) =>
    /^neon_/.test(String(a.id || "")) ||
    (a.faction === SH.neonFaction && inNeon(a));
  const isDoomed = (a) =>
    !!(
      SH.doomedFactions.indexOf(a.faction) >= 0 ||
      DOOMED_TYPE_RE.test(String(a.type || "")) ||
      isNeonFolk(a)
    );

  // ------------------------------------------------------------------
  // Locks (codes in Crane's duty log; his keys open both)
  // ------------------------------------------------------------------
  const LOCKS = {
    evidence: {
      id: "ms_lib_evidence",
      label: "Liberty Station Evidence Locker",
      kind: "container",
      code: "4471",
      key: "ms_crane_key",
      hint: "Colonel Crane's duty log (command post), or his keys.",
      learnedFrom: ["Colonel Crane's duty log (Liberty command post)"],
      keyFrom: "Colonel Crane",
    },
    safe: {
      id: "ms_lib_safe",
      label: "Colonel Crane's Safe",
      kind: "container",
      code: "0304",
      key: "ms_crane_key",
      hint: "Colonel Crane's duty log (command post), or his keys.",
      learnedFrom: ["Colonel Crane's duty log (Liberty command post)"],
      keyFrom: "Colonel Crane",
    },
    casemate: {
      id: "ms_lib_casemate",
      label: "Fort Wood Casemate Cell",
      kind: "door",
      key: "ms_casemate_key",
      hint: "The guard's key ring hangs in the gift shop where Zeke is held.",
      keyFrom: "Zeke Marlow (gift shop)",
    },
  };
  function registerLocks() {
    if (!G.locks || !G.locks.register || G.isStub("locks")) return;
    for (const k in LOCKS) {
      try {
        G.locks.register(Object.assign({}, LOCKS[k]));
      } catch (e) {
        /* */
      }
    }
    try {
      if (G.locks.learnableFrom) {
        G.locks.learnableFrom(LOCKS.evidence.id, "Colonel Crane's duty log");
        G.locks.learnableFrom(LOCKS.safe.id, "Colonel Crane's duty log");
      }
    } catch (e) {
      /* */
    }
    try {
      if (G.locks.obtainableFrom) {
        G.locks.obtainableFrom(
          "ms_crane_key",
          "Colonel Crane (surrender, alliance or his body)",
        );
        G.locks.obtainableFrom("ms_casemate_key", "Zeke Marlow (mq26)");
      }
    } catch (e) {
      /* */
    }
  }
  function knows(id) {
    return !!(
      G.locks &&
      !G.isStub("locks") &&
      G.locks.isKnown &&
      G.locks.isKnown(id)
    );
  }

  // ------------------------------------------------------------------
  // Placement (statue anchors, else a ring around the pedestal)
  // ------------------------------------------------------------------
  function statueSpot(names, angle, dist) {
    const c = LIB();
    const dock =
      L.spots && L.spots.libertyDock
        ? L.spots.libertyDock()
        : { x: c.x + 30, z: c.z - 30 };
    const base = Math.atan2(dock.z - c.z, dock.x - c.x) + (angle || 0);
    return {
      site: "statue_of_liberty",
      anchors: names,
      fallback: {
        x: c.x + Math.cos(base) * dist,
        z: c.z + Math.sin(base) * dist,
      },
      maxR: 10,
    };
  }
  const spot = (names, angle, dist) => {
    const a = statueSpot(names, angle, dist);
    return L.anchor(a.site, a.anchors, a.fallback, { maxR: 10 });
  };
  const SPOTS = {
    crane: () => statueSpot(["commander", "crane", "boss"], 0, 16),
    command: () =>
      statueSpot(["command_post", "commander", "terminal"], 0.1, 15),
    poster: () =>
      statueSpot(["noticeboard", "command_post", "commander"], 0.2, 15),
    zeke: () =>
      statueSpot(
        ["gift_shop", "prisoner", "torch_display", "footlocker"],
        -0.5,
        19,
      ),
    casemate: () =>
      statueSpot(
        ["casemate_cell", "casemate", "star_fort", "spawn_in2"],
        1.2,
        30,
      ),
    gate: () => statueSpot(["side_gate", "sally_port", "gate"], -1.0, 34),
    torch: () =>
      statueSpot(
        ["torch_control", "terminal", "control", "pedestal_terminal"],
        0.35,
        20,
      ),
  };
  function torchTerminalSpot() {
    const a = SPOTS.torch();
    return L.anchor(a.site, a.anchors, a.fallback, { maxR: 10 });
  }
  function craneSpot() {
    const a = SPOTS.crane();
    return L.anchor(a.site, a.anchors, a.fallback, { maxR: 10 });
  }
  const mk = (s, label) => {
    const p = typeof s === "function" ? s() : s;
    return [{ anchor: [p.site, p.anchors], fallback: p.fallback, label }];
  };
  const liberty = { evidence: null, safe: null }; // resolved container spots (markers)

  // ------------------------------------------------------------------
  // Notes and items
  // ------------------------------------------------------------------
  L.hook("init", function () {
    const N = (d) =>
      L.defineItem(
        Object.assign(
          {
            type: "note",
            weight: 0,
            value: 0,
            quest: true,
            desc: "Read it with your VIGIL goggles (NOTES).",
          },
          d,
        ),
      );
    N({
      id: "ms_note_crane_duty",
      name: "Colonel Crane's Duty Log",
      title: "LIBERTY STATION — COMMANDING OFFICER'S DUTY LOG (extract)",
      learn: [LOCKS.evidence.id, LOCKS.safe.id],
      text:
        "Evidence locker: combination changed to 4471 (Father's service number, last four. If I forget it I deserve to).\nSafe: 0304. The date the rolls came to the island.\n\n" +
        'Asset MARLOW: gift shop. Continues to refuse. Has repaired the water heater "out of spite."\nDirector CALLOWAY (C-9): casemate cell, Fort Wood. Arrived by rowboat asking, "as a federal employee," what in God\'s name we were doing. Detained pending. She asks for coffee. We have none either.\n\n' +
        "Pvt. Teague: keeps volunteering for the night watch on the pier. Commend his zeal. Watch his zeal.\n\n" +
        "Item received from the sun cult's emissary, Nov. '88: request for KEY B. Refused. Key B is in the evidence locker with the Bureau's codebook, where it will stay until the Array has done its work. A bomb that does not exist does not need a key. I keep it anyway.",
    });
    N({
      id: "ms_note_file_670305",
      name: "FILE 67-03-05 (Liberty Station safe)",
      title: "OFFICE OF CIVIL DEFENSE — EYES ONLY — FILE 67-03-05: ATTRIBUTION",
      text:
        "1. ORDER. The strike on New York was ordered in Brussels on 3 March 1967 by the Council of the Western European Union, on a vote of six to one. Paris voted against. Paris was outvoted. The order was signed at 07:15 on 4 March.\n\n" +
        '2. BASIS. The Council acted on Bureau Sept\'s dossier HIVER ("WINTER"), which concluded that the United States would freeze its civil defence leadership against a first strike (Project Long Winter) and was therefore preparing one. HIVER drew on forty-one sources. Source LUMIERE (New York, since summer 1966, UN interpreting staff, unwitting) is one of forty-one.\n\n' +
        '3. FOREKNOWLEDGE. The Office of Civil Defense intercepted and read the order at 07:40 on 4 March 1967, twenty-six hours before the strike. Administrator R. Marsh directed that the 1967 enrolment rolls and enrolled staff be moved to Liberty Island that night. No public warning was issued. ("PROTECT THE SOURCE. M.")\n\n' +
        "4. THE STRIKE. Flight SIROCCO, two aircraft. SIROCCO ONE: weapon detonated 09:47 over the Bronx–Yonkers line. SIROCCO TWO: hit by a Nike Hercules battery, came down in the North Woods of Central Park. Weapon fuse froze. WEAPON NEVER RECOVERED. Search suspended 1969.\n\n" +
        "5. ANNEX. The Deed of Conveyance (Manhattan to the OCD, $1, 4 March 1967) and the Relief Station ledgers of 1968 are filed separately.\n\n[A page is clipped to the back: a diagram of SIROCCO TWO's weapon. Two keyways. A cipher wheel. A 28-volt firing set.]",
    });
    N({
      id: "ms_note_wanted_1968",
      name: 'Wanted Poster: "The Match Woman" (1968)',
      title: "OFFICE OF CIVIL DEFENSE — WANTED — 1968",
      text: "THE MATCH WOMAN\n\nMEAD, N. — ARSON — 12 DEAD (Relief Station, Grand Central, 5 March 1968)\n\nWhite female, about 29, dark hair, Canadian accent. Burns to the left hand and jaw. Last seen carrying an infant.\n\n[The sketch is of a young woman with her chin up. Someone in the Relief Station drew her from memory and got most of it right.]\n\nSTATUS (pencilled, 1968): PRESUMED DEAD. FILE CLOSED.\nSTATUS (pencilled, later, a different hand): NOT BELIEVED. — A.C.",
    });
    L.defineItem({
      id: "ms_key_b",
      type: "key",
      name: "Key B (SIROCCO 2, navigator's)",
      weight: 0.2,
      value: 0,
      quest: true,
      desc: "A heavy steel arming key on a lanyard, stamped in French: CLÉ B — NAVIGATEUR — SIROCCO 2. It was taken off a body in the North Woods in 1967 and has been in a federal evidence locker ever since. Somewhere under the city there is a lock it fits.",
    });
    L.defineItem({
      id: "ms_crane_key",
      type: "key",
      name: "Colonel Crane's Keys",
      weight: 0.1,
      value: 0,
      quest: true,
      desc: "A ring of keys from Liberty Station's commanding officer: the evidence locker, the safe, the torch stair.",
    });
    L.defineItem({
      id: "ms_casemate_key",
      type: "key",
      name: "Casemate Cell Key",
      weight: 0.1,
      value: 0,
      quest: true,
      desc: "A guard's key ring from the gift shop on Liberty Island. Zeke stared at it for weeks.",
    });
    L.defineItem({
      id: "ms_sirocco_codebook",
      type: "note",
      name: "SIROCCO Codebook (Bureau Sept)",
      title: "BUREAU SEPT — CARNET SIROCCO",
      weight: 0.2,
      value: 0,
      quest: true,
      desc: "Read it with your VIGIL goggles (NOTES).",
      text: "Corbeau's copy of the SIROCCO flight codebook: call signs, frequencies and, on the last page, a column of arming words for the weapons' cipher wheels, each one crossed out after use except the second.\n\n[You do not read the word aloud. You will need it, or someone will.]",
    });
  });

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
  L.hook("init", function () {
    const M = ms();
    M.quest({
      id: "mq06",
      giver: "(continues the crossing)",
      location: "Liberty Island",
      desc: () =>
        "Liberty Station: the star fort and the pedestal under the Statue, where the Continuity holds Zeke, Dr. Calloway and Key B. " +
        (faction() === "covenant"
          ? "The Lancers are landing with you."
          : faction() === "continuity"
            ? "The Colonel is expecting you as a guest."
            : "You are on your own.") +
        (roseHere() ? " " + roseName() + " came with you." : ""),
      stages: [
        {
          id: "land",
          text: "Land on Liberty Island.",
          markers: () => {
            const d =
              L.spots && L.spots.libertyDock ? L.spots.libertyDock() : LIB();
            return [{ x: d.x, z: d.z, label: "Liberty Island" }];
          },
        },
        {
          id: "pedestal",
          text: () =>
            L.flag("ms_teague") === "free" && !L.flag("ms_gate_opened")
              ? "Get into the pedestal: storm the star fort, or try Private Teague's side gate."
              : "Get into the star fort and the pedestal.",
          markers: () => {
            const m = mk(SPOTS.command, "The pedestal");
            if (L.flag("ms_teague") === "free" && !L.flag("ms_gate_opened"))
              m.push({ npc: "ms_teague", label: "Side gate (Private Teague)" });
            return m;
          },
          onEnter() {
            stormBeach();
          },
        },
        {
          id: "command",
          text: "Reach the command post in the pedestal.",
          markers: () => mk(SPOTS.command, "Command post"),
        },
        {
          id: "poster",
          text: "(Optional) Take the wanted poster from the noticeboard.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq06", "pedestal"),
          doneIf: () => !!(ms() && ms().hasToken("poster")),
          markers: () => mk(SPOTS.poster, "Noticeboard"),
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        L.later(0.5, () => ms().next("mq25"));
      },
    });

    M.quest({
      id: "mq25",
      giver: "Colonel Augustus Crane",
      location: "Liberty Station command post",
      desc: () =>
        "Colonel Augustus Crane wants a clean sky by Directive 7-A, run on the very list that marked " +
        (L.flag("ms_rose_revealed") ? "Rose" : "your daughter") +
        ' for sterilisation. He also wants the "Match Woman" who burned his father in 1968.',
      stages: [
        {
          id: "confront",
          text: () =>
            L.flag("crane_fight")
              ? "Defeat Colonel Crane."
              : "Confront Colonel Crane.",
          markers: () => {
            const p = craneSpot() || LIB();
            return [
              { npc: "lib_crane", label: "Colonel Crane", x: p.x, z: p.z },
            ];
          },
        },
        {
          id: "cr_talk",
          text: "(Optional) Talk Colonel Crane into standing down.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () =>
            L.flag("ms_crane") === "surrendered" && !L.flag("crane_genome"),
        },
        {
          id: "cr_rolls",
          text: "(Optional) The rolls argument: his own soldiers aren't on the 1967 rolls.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("crane_genome"),
        },
        {
          id: "cr_kill",
          text: "(Optional) Defeat Colonel Crane.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("crane_dead"),
        },
        {
          id: "cr_ally",
          text: "(Optional) Stand with Colonel Crane.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("crane_ally"),
        },
        {
          id: "cr_shield",
          text: () =>
            "(Optional) Keep Crane from finding out who " + roseName() + " is.",
          sideObjective: true,
          optional: true,
          showIf: () => roseHere() && !L.flag("ms_rose_detained"),
          doneIf: () => !!L.flag("ms_rose_hidden"),
          failIf: () => !!L.flag("ms_rose_detained"),
        },
      ],
      rewards: { xp: 500 },
      onComplete() {
        L.later(0.5, () => ms().next("mq26"));
      },
    });

    M.quest({
      id: "mq26",
      giver: "Zeke Marlow / Dr. Ruth Calloway",
      location: "Liberty Island",
      desc: "Zeke is held in the old gift shop and Director Calloway in a casemate cell of Fort Wood. Somewhere in Liberty Station's evidence locker is Key B, the second key of the Glowkeepers' bomb.",
      stages: [
        {
          id: "zeke",
          text: "Free Zeke from the gift shop.",
          markers: () => [{ npc: "lib_zeke", label: "Zeke Marlow" }],
        },
        {
          id: "calloway",
          text: () =>
            L.flag("ms_casemate_open")
              ? "Talk to Dr. Calloway."
              : "Free Dr. Calloway from the casemate cell in Fort Wood.",
          markers: () =>
            L.flag("ms_casemate_open")
              ? [{ npc: "ms_calloway", label: "Dr. Calloway" }]
              : mk(SPOTS.casemate, "Casemate cell"),
        },
        {
          id: "locker",
          text: () =>
            "Open the evidence locker (" +
            (knows(LOCKS.evidence.id)
              ? "code 4471"
              : "the code is in Crane's duty log, or use his keys") +
            ").",
          markers: () =>
            liberty.evidence
              ? [
                  {
                    x: liberty.evidence.x,
                    z: liberty.evidence.z,
                    y: liberty.evidence.y,
                    label: "Evidence locker",
                  },
                ]
              : [],
        },
        {
          id: "keyb",
          text: "Decide what happens to Key B.",
          markers: () => (roseHere() ? ms().rose.marker("Rose") : []),
          onEnter() {
            L.later(0.6, () => {
              if (at("mq26", "keyb") && ms()) ms().talk("dlg_ms_keyb", "Key B");
            });
          },
        },
        {
          id: "brig",
          text: () => "(Optional) Get " + roseName() + " out of the brig.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_rose_detained"),
          doneIf: () => !!L.flag("ms_rose_freed"),
          markers: () =>
            L.flag("ms_rose_freed") ? [] : ms().rose.marker("Rose (detained)"),
        },
        {
          id: "sept",
          text: "(Optional) Free Lys and Corbeau and take the SIROCCO codebook.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            L.flag("ms_bureau") === "expose" && Q.reached("mq26", "locker"),
          doneIf: () =>
            !!L.flag("ms_codebook_taken") || !!L.flag("ms_sept_freed"),
          markers: () => [{ npc: "ms_lys_cell", label: "Lys and Corbeau" }],
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        L.later(0.5, () => ms().next("mq27"));
      },
    });

    M.quest({
      id: "mq27",
      giver: "(the file)",
      location: "Liberty Station: Crane's safe",
      desc: "Crane's safe holds FILE 67-03-05: who gave the order, who knew, and the missing second bomb. It is the answer Corbeau has wanted for twenty-two years.",
      stages: [
        {
          id: "safe",
          text: () =>
            "Open Crane's safe (" +
            (knows(LOCKS.safe.id)
              ? "code 0304"
              : "his duty log has the code, or use his keys") +
            ").",
          markers: () =>
            liberty.safe
              ? [
                  {
                    x: liberty.safe.x,
                    z: liberty.safe.z,
                    y: liberty.safe.y,
                    label: "Crane's safe",
                  },
                ]
              : [],
        },
        {
          id: "read",
          text: "Read FILE 67-03-05 (goggles → NOTES).",
          markers: () => [],
        },
        {
          id: "decide",
          text: "Decide what to do with the file.",
          markers: () => [],
        },
      ],
      rewards: { xp: 450 },
      onComplete() {
        L.later(0.5, () => ms().next("mq28"));
      },
    });

    M.quest({
      id: "mq28",
      giver: "Zeke Marlow",
      location: "Statue of Liberty: the torch teletype",
      desc: "The Knickerbocker Array charges on the tide for six days, so whatever you load fires at noon on Sunday. Choose what it will do.",
      stages: [
        {
          id: "climb",
          text: "Go up to the torch control teletype with Zeke.",
          markers: () => {
            const p = L.termPos("liberty_torch");
            return p
              ? [{ x: p.x, z: p.z, label: "Torch Control" }]
              : mk(SPOTS.torch, "Torch Control");
          },
        },
        {
          id: "choose",
          text: "Choose what the Array will do: RECLAMATION, SELECTIVE, CHARTER OVERRIDE or OVERLOAD.",
          markers: () => {
            const p = L.termPos("liberty_torch");
            return p ? [{ x: p.x, z: p.z, label: "Torch Control" }] : [];
          },
        },
      ],
      rewards: { xp: 800 },
      onComplete() {
        // Zeke and Calloway go home to Grand Central; Rose goes back to her roof.
        L.setFlag("zeke_home");
        if (L.flag("ms_calloway_free")) L.setFlag("ms_calloway_home");
        if (ms()) {
          ms().rose.place("home");
          L.later(0.5, () => ms().next("mq29"));
        }
        L.later(1, () => {
          placeZeke();
          placeCalloway();
        });
      },
    });
  });

  // ------------------------------------------------------------------
  // The crossing hand-off (called by mq24 in 64_ms_act3.js)
  // ------------------------------------------------------------------
  function arrive(how) {
    L.setFlag("ms_liberty_how", how || "ferry");
    if (Q.isActive("mq24")) Q.complete("mq24");
    const dock =
      L.spots && L.spots.libertyDock
        ? L.spots.libertyDock()
        : { x: LIB().x + 40, z: LIB().z - 40 };
    const d =
      how === "rotorcraft"
        ? L.anchor(
            "statue_of_liberty",
            ["rotorcraft", "helipad", "dock"],
            dock,
          ) || dock
        : dock;
    L.sfx(how === "rotorcraft" ? "ui_select" : "door_open", { volume: 0.5 });
    L.travel(
      d.x,
      d.y || 0,
      d.z,
      Math.atan2(-(LIB().x - d.x), -(LIB().z - d.z)),
      () => {
        L.notify(
          how === "rotorcraft"
            ? "The Rotorcraft banks low over the harbour and sets you down on Liberty Island in a storm of rotor-wash."
            : how === "lancers"
              ? "The Lancers' boats grind up onto the shingle under the star fort. Exo-rigs splash ashore around you, gyrojet carbines up."
              : "The ferry noses up against Liberty Island's crumbling pier. Ossie is already turning back.",
          { duration: 6 },
        );
        if (roseHere() && ms()) ms().rose.place("follow");
        L.later(0.6, () => {
          if (!Q.isStarted("mq06")) ms().next("mq06");
          L.later(0.8, landed);
        });
      },
    );
  }
  function landed() {
    if (!at("mq06", "land")) return;
    if (faction() === "continuity" && !L.flag("con_hostile")) {
      Q.setStage("mq06", "command");
      L.later(1, () =>
        L.say(
          "lib_crane",
          "There you are. Come up, come up — history is waiting, and it hates to be kept waiting.",
        ),
      );
    } else Q.setStage("mq06", "pedestal");
  }
  // Arrival by any means (ferry, Rotorcraft, swimming) while mq06 waits for the landing.
  L.trigger({
    id: "liberty_arrive",
    once: false,
    cooldown: 2,
    cond: () => {
      if (!at("mq06", "land")) return false;
      const c = LIB(),
        p = G.player.pos;
      return Math.hypot(p.x - c.x, p.z - c.z) < c.r + 28;
    },
    fire() {
      landed();
    },
  });
  // Ossie's ferry (50_downtown) also counts as the crossing while mq24 is active.
  G.events.on("ferryArrived", (where) => {
    if (where !== "liberty" || !Q.isActive("mq24")) return;
    L.setFlag("ms_liberty_how", L.flag("ms_liberty_how") || "ferry");
    Q.complete("mq24");
    if (roseHere() && ms()) ms().rose.place("follow");
    L.later(0.8, () => {
      if (ms()) ms().next("mq06");
      L.later(0.8, landed);
    });
  });

  // Keep the Continuity garrison friendly for Continuity-path players (local truce zone around the statue);
  // Teague's side gate quiets the garrison too.
  const libertyGuest = () =>
    faction() === "continuity" &&
    !L.flag("crane_fight") &&
    !L.flag("con_hostile");
  const gateQuiet = () => !!L.flag("ms_gate_opened") && !L.flag("crane_fight");
  function libertyZones() {
    L.truceZone("liberty_guest", {
      faction: SH.conFaction,
      x: LIB().x,
      z: LIB().z,
      r: 200,
      cond: libertyGuest,
    });
    L.truceZone("ms_liberty_gate", {
      faction: SH.conFaction,
      x: LIB().x,
      z: LIB().z,
      r: 120,
      cond: gateQuiet,
    });
  }
  L.hook("init", libertyZones);
  L.hook("reset", libertyZones);

  // Reaching the pedestal / the command post moves mq06 on.
  L.trigger({
    id: "ms_lib_pedestal",
    once: false,
    cooldown: 1.5,
    pos: () => ms() && ms().resolve(SPOTS.command()),
    r: 24,
    cond: () => at("mq06", "pedestal"),
    fire() {
      Q.setStage("mq06", "command");
    },
  });
  L.trigger({
    id: "ms_lib_command",
    once: false,
    cooldown: 1.5,
    pos: () => ms() && ms().resolve(SPOTS.command()),
    r: 9,
    cond: () => at("mq06", "command") && !L.flag("ms_lib_command_seen"),
    fire() {
      L.setFlag("ms_lib_command_seen");
      L.notify(
        "The command post: maps of the harbour pinned in rows, a teletype chattering to nobody, a noticeboard of 1968 orders curling at the corners.",
        { duration: 6 },
      );
      if (roseHere())
        L.later(2, () =>
          ms().rose.say(
            "[Rose stops in front of the noticeboard. A wanted poster: THE MATCH WOMAN. She looks at it a long moment, then away.] They drew her chin wrong.",
          ),
        );
      L.later(roseHere() ? 6 : 1.5, () => {
        if (at("mq06", "command")) Q.complete("mq06");
      });
    },
  });
  L.trigger({
    id: "crane_near",
    once: false,
    cooldown: 2,
    pos: () => {
      const a = L.npc("lib_crane");
      return a && !a.dead ? a.pos : null;
    },
    r: 20,
    cond: () => at("mq06", "pedestal") || at("mq06", "command"),
    fire() {
      if (Q.isActive("mq06")) Q.complete("mq06");
      L.say(
        "lib_crane",
        "Hold your fire! HOLD. I want to speak to the volunteer.",
      );
    },
  });

  function stormBeach() {
    L.hint(
      "storm",
      "The Continuity garrison is dug in around the statue. Use cover, and keep a Rally Tonic handy.",
      1,
    );
    if (faction() === "covenant") {
      spawnCovSquad();
      L.later(1.5, () =>
        L.say(
          "lib_cov_castillo",
          "Lancers! Advance on the statue! Iron keeps!",
        ),
      );
    }
    if (L.flag("hale_defects") || L.flag("ms_skyeye_jammed")) {
      L.later(4, () => {
        L.notify(
          L.flag("ms_skyeye_jammed")
            ? "The Sky-Eye drones over the island wobble, lose their carrier and drop into the harbour one after another. Static Okonkwo's jam is holding."
            : "Every Sky-Eye drone on the island drops out of the sky at once. Somewhere across the water, Lieutenant Hale has kept her word.",
        );
        if (!G.isStub("actors") && G.actors.list)
          for (const a of G.actors.list())
            if (
              !a.dead &&
              isSkyEye(a) &&
              Math.hypot(a.pos.x - LIB().x, a.pos.z - LIB().z) < 200
            ) {
              try {
                a.kill();
              } catch (e) {
                /* */
              }
            }
      });
    }
    if (L.flag("ms_wayte_file_closed"))
      L.later(2, () =>
        L.notify(
          "FILE C-9/WAYTE CLOSED: the pier sentries glance at your cryo suit and go back to their cigarettes. Nobody here is expecting you any more.",
          { duration: 6 },
        ),
      );
    if (L.flag("ms_core") === "broadcast")
      L.later(3, () =>
        L.notify(
          "Half the sandbag posts are empty. After Rocky read Marsh's memo on the air, a lot of the garrison found somewhere else to be.",
          { duration: 6 },
        ),
      );
    if (!G.isStub("music") && G.music.setMood)
      try {
        G.music.setMood("combat");
      } catch (e) {
        /* */
      }
  }
  function spawnCovSquad() {
    const d = L.spots.libertyDock();
    const around = (dx, dz) => ({
      fallback: { x: d.x + dx, z: d.z + dz, y: d.y },
      maxR: 8,
    });
    if (!L.flag("stroud_dead")) {
      L.removeNPC("cov_stroud");
      L.spawnNPC({
        id: "cov_stroud",
        type: "human",
        name: "Lancer-Commander Stroud",
        outfit: SH.covRig,
        gender: "m",
        faction: SH.covFaction,
        ai: "follow",
        level: 14,
        hp: 400,
        at: around(2, 2),
        weapon: [SH.gyroCarbine],
        dialogue: "dlg_cov_stroud",
        essential: true,
        barks: ["Push forward!", "Target the heavy rigs!", "Iron keeps!"],
      });
    }
    L.spawnNPC({
      id: "lib_cov_castillo",
      type: "human",
      name: "Lancer Castillo",
      outfit: SH.covRig,
      gender: "f",
      faction: SH.covFaction,
      ai: "follow",
      level: 10,
      hp: 300,
      at: around(-2, 3),
      weapon: [SH.gyroCarbine, "assault_rifle"],
      barks: ["Contact!", "Moving up!", "For the Charter!"],
    });
    L.spawnNPC({
      id: "lib_cov_albright",
      type: "human",
      name: "Lancer Albright",
      outfit: SH.covRig,
      gender: "m",
      faction: SH.covFaction,
      ai: "follow",
      level: 11,
      hp: 320,
      at: around(3, -2),
      weapon: [SH.rotaryCannon, SH.gyroCarbine],
      barks: ["Suppressing fire!", "File THIS, paper-pushers!", "Reloading!"],
    });
    for (const id of ["cov_stroud", "lib_cov_castillo", "lib_cov_albright"]) {
      const a = L.npc(id);
      if (a && a.follow) {
        try {
          a.follow(G.player);
        } catch (e) {
          /* */
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // NPCs on the island
  // ------------------------------------------------------------------
  const sentriesHostile = () =>
    faction() !== "continuity" && !L.flag("crane_surrendered") && !gateQuiet();
  L.hook("spawn", function () {
    if (!L.flag("crane_gone")) {
      const hostile = !!L.flag("crane_fight");
      L.spawnNPC({
        id: "lib_crane",
        type: "human",
        name: "Colonel Augustus Crane",
        outfit: SH.conRig,
        gender: "m",
        faction: SH.conFaction,
        ai: "guard",
        home: "here",
        homeR: 3,
        hostile,
        essential: !hostile,
        level: 18,
        hp: 650,
        damage: 30,
        weapon: [SH.gyroCarbine],
        inventory: [
          ["q_note_crane_log", 1],
          ["ms_note_crane_duty", 1],
          ["ms_crane_key", 1],
          ["ammo_flamer_fuel", 60],
          ["ammo_gyrojet", 40],
        ],
        at: SPOTS.crane(),
        dialogue: "dlg_lib_crane",
        barks: [
          "God bless America.",
          "Steady, soldiers.",
          "History is watching. Sign in.",
        ],
        voice: "m_officer",
      });
      L.spawnNPC({
        id: "lib_rourke",
        type: SH.conSoldier,
        name: "Sergeant Rourke",
        outfit: SH.conRig,
        faction: SH.conFaction,
        ai: "guard",
        home: "here",
        homeR: 4,
        hostile: sentriesHostile(),
        level: 14,
        weapon: [SH.gyroCarbine],
        at: statueSpot(["spawn_in1", "spawn5", "spawn1"], 0.25, 18),
        barks: ["Perimeter secure.", "Eyes on the water!"],
      });
      L.spawnNPC({
        id: "lib_dunn",
        type: SH.conSoldier,
        name: "Private Dunn",
        outfit: SH.conRig,
        faction: SH.conFaction,
        ai: "guard",
        home: "here",
        homeR: 4,
        hostile: sentriesHostile(),
        level: 12,
        weapon: [SH.gyroCarbine],
        at: statueSpot(["spawn_in2", "spawn6", "spawn2"], -0.25, 18),
        barks: ["Yes, sir!", "Is that the second sleeper?"],
      });
    }
    placeZeke();
    placeCalloway();
    if (
      faction() === "covenant" &&
      Q.isActive("mq06") &&
      Q.stage("mq06") !== "land"
    )
      spawnCovSquad();
  });

  // Zeke: on the island until the torch is decided, then at the Grand Central Oyster Bar. Act V may move him (ms.zekePlace).
  function zekeWhere() {
    const custom = L.flag("ms_zeke_at");
    if (custom) return custom;
    if (L.flag("zeke_home"))
      return {
        site: "grand_central",
        anchors: ["bar", "oyster_bar", "merchant2"],
        fallback: { x: 226, z: -238 },
        dx: 1.5,
        dz: 1.0,
      };
    return SPOTS.zeke();
  }
  function placeZeke() {
    if (L.flag("dead_lib_zeke") || !ms()) return;
    const p0 = ms().resolve(zekeWhere());
    if (!p0) return;
    const p = L.freeSpot(p0.x, p0.z, p0.y, { maxR: 5 });
    const a = L.npc("lib_zeke");
    if (!a)
      L.spawnNPC({
        id: "lib_zeke",
        type: "human",
        name: "Zeke Marlow",
        outfit: SH.cryoSuit,
        gender: "m",
        faction: SH.sleeperFaction,
        ai: "static",
        essential: true,
        hostile: false,
        dialogue: "dlg_lib_zeke",
        hair: "grey",
        skinTone: 0.35,
        voice: "m_old",
        barks: [
          "Water pressure on this island is a crime.",
          first() + "? That you?",
        ],
        pos: p,
      });
    else if (Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 6)
      L.moveNPC("lib_zeke", p);
  }
  // Calloway: in her cell until freed; Grand Central after the torch. Act V may move her (ms.callowayPlace).
  function placeCalloway() {
    if (L.flag("dead_ms_calloway") || !ms()) return;
    let w;
    if (L.flag("ms_calloway_at")) w = L.flag("ms_calloway_at");
    else if (L.flag("ms_calloway_home"))
      w = {
        site: "grand_central",
        anchors: ["bar", "oyster_bar", "merchant2"],
        fallback: { x: 226, z: -238 },
        dx: -1.6,
        dz: 1.2,
      };
    else w = SPOTS.casemate();
    const p0 = ms().resolve(w);
    if (!p0) return;
    const p = L.freeSpot(p0.x, p0.z, p0.y, { maxR: 5 });
    const a = L.npc("ms_calloway");
    if (!a)
      L.spawnNPC({
        id: "ms_calloway",
        type: "director_calloway",
        preset: "calloway",
        name: "Dr. Ruth Calloway",
        outfit: "director_suit",
        gender: "f",
        age: 66,
        hair: "bun",
        hairColor: 0xc9c3b8,
        glasses: true,
        faction: SH.sleeperFaction,
        ai: "static",
        essential: true,
        hostile: false,
        dialogue: "dlg_ms_calloway",
        pos: p,
        barks: [
          "Coffee. Is there coffee? There is never coffee.",
          "Twenty-two years, and the paperwork still isn't done.",
        ],
      });
    else if (Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 6)
      L.moveNPC("ms_calloway", p);
  }
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.zekePlace = function (where) {
      L.setFlag("ms_zeke_at", where || null);
      placeZeke();
    };
    M.callowayPlace = function (where) {
      L.setFlag("ms_calloway_at", where || null);
      placeCalloway();
    };
    M.liberty = { arrive, landed };
    M.fireArray = fireArray;
    M.worldSlides = worldSlides;
  });

  // Teague at the side gate (only if he wasn't reported): the passphrase "A DIMANCHE".
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.actor({
      id: "ms_teague",
      when: () =>
        L.flag("ms_teague") === "free" &&
        (at("mq06", "pedestal") || at("mq06", "land")) &&
        !L.flag("ms_gate_opened"),
      def: () => ({
        type: "private_teague",
        preset: "teague",
        name: "Private Teague",
        gender: "m",
        age: 20,
        outfit: "continuity_uniform",
        faction: SH.conFaction,
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 2,
        level: 6,
        dialogue: "dlg_ms_teague",
        at: SPOTS.gate(),
        barks: ["Halt. ...Password?"],
      }),
    });
    M.dlg("dlg_ms_teague", "gate").add({
      gate: {
        speaker: "Private Teague",
        text: "[A young private at the sally port of the star fort, rifle held wrong, eyes too bright. Under his collar you can see a cord with something round on it.] Halt. Who goes there. ...You have to say the word. I can't open it unless you say the word.",
        responses: [
          { text: '"A dimanche."', next: "open" },
          { text: '"Long Winter."', next: "wrong" },
          { text: "[Leave him.]" },
        ],
      },
      open: {
        text: "[He breathes out.] The Light keeps. [He unbolts the gate.] Through the casemates, up the stair, you'll come out under the command post. They're all down at the beach. Go. She said you'd come. She said you'd know the word.",
        onEnter() {
          L.setFlag("ms_gate_opened");
          L.xp(60, "Teague's gate");
          for (const id of ["lib_rourke", "lib_dunn"]) L.hostile(id, false);
          if (at("mq06", "pedestal")) Q.setStage("mq06", "command");
        },
        responses: [
          { text: "Who said?", next: "who" },
          { text: "[Go through.]" },
        ],
      },
      who: {
        text: "The Dawn. [He touches the round thing under his collar.] I can't say more. I already said more. Go.",
        responses: [{ text: "[Go through.]" }],
      },
      wrong: {
        text: "That's — no. No, that's the Colonel's word. [He looks like he might cry.] Please go away.",
        responses: [
          { text: "[Try again.]", next: "gate" },
          { text: "[Leave him.]" },
        ],
      },
    });
  });

  L.hook("world", function () {
    registerLocks();
    // landmarks_b places a teletype in the pedestal command room; it IS the torch control. Otherwise we place our own.
    const lb =
      !G.isStub("landmarks") && G.landmarks.getAnchor
        ? G.landmarks.getAnchor("statue_of_liberty", "terminal")
        : null;
    if (lb && isFinite(lb.x))
      L.world.term_liberty_torch = {
        pos: L.V3(lb.x, (lb.y || 0) + 1.1, lb.z),
        handle: null,
        external: true,
      };
    else {
      const t = torchTerminalSpot();
      if (t) L.spawnTerminal("liberty_torch", t, 0);
    }
  });
  L.hook("register", registerLocks);

  // Liberty set dressing the quests need: the duty log on the command desk, the evidence locker, Crane's safe.
  let libGen = -1;
  L.hook("spawn", function () {
    if (libGen === L.gen) return;
    libGen = L.gen;
    const cp = spot(["command_desk", "command_post", "commander"], 0.12, 15);
    if (cp && !L.has("ms_note_crane_duty"))
      L.pickup("ms_crane_duty", "ms_note_crane_duty", 1, {
        x: cp.x + 0.8,
        y: cp.y,
        z: cp.z + 0.4,
      });
    const ev0 = spot(["evidence_locker", "armory", "footlocker"], 0.45, 17);
    const ev = ev0 ? L.freeSpot(ev0.x, ev0.z, ev0.y, { maxR: 4 }) : null;
    liberty.evidence = ev;
    if (ev && !L.flag("ms_evidence_emptied")) {
      const items = [["ms_key_b", 1]];
      if (L.flag("ms_codebook_on_liberty") || L.flag("ms_bureau") === "expose")
        items.push(["ms_sirocco_codebook", 1]);
      const h = L.dyn(
        L.prop("locker", {
          x: ev.x,
          y: ev.y,
          z: ev.z,
          yaw: 0,
          items,
          name: "Evidence Locker",
          id: "ms_lib_evidence_locker",
          lock: Object.assign({}, LOCKS.evidence),
          noSave: false,
        }),
      );
      if (!h || (!h.container && !h.interactable))
        L.pickup("ms_keyb_fb", "ms_key_b", 1, {
          x: ev.x,
          y: (ev.y || 0) + 0.9,
          z: ev.z,
        });
    }
    const sf0 = spot(["crane_safe", "safe", "commander"], -0.2, 15);
    const sf = sf0 ? L.freeSpot(sf0.x + 1.2, sf0.z, sf0.y, { maxR: 4 }) : null;
    liberty.safe = sf;
    if (sf && !L.flag("ms_safe_emptied")) {
      const h = L.dyn(
        L.prop("safe", {
          x: sf.x,
          y: sf.y,
          z: sf.z,
          yaw: 0,
          items: [["ms_note_file_670305", 1]],
          name: "Colonel Crane's Safe",
          id: "ms_lib_crane_safe",
          lock: Object.assign({}, LOCKS.safe),
          noSave: false,
        }),
      );
      if (!h || (!h.container && !h.interactable))
        L.pickup("ms_file_fb", "ms_note_file_670305", 1, {
          x: sf.x,
          y: (sf.y || 0) + 0.9,
          z: sf.z,
        });
    }
  });
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.spot({
      id: "ms_spot_poster",
      label: "Noticeboard (wanted poster)",
      verb: "Read",
      when: () => Q.isStarted("mq06") && !M.hasToken("poster"),
      at: SPOTS.poster,
      use() {
        M.talk("dlg_ms_poster", "Noticeboard");
      },
    });
    M.dlg("dlg_ms_poster", "look").add({
      look: {
        speaker: "",
        text: "A wanted poster from 1968, yellow under its drawing pins: THE MATCH WOMAN. MEAD, N. — ARSON — 12 DEAD. A sketch of a woman of about twenty-nine with her chin up, drawn from memory by someone who mostly got it right. Pencilled underneath: PRESUMED DEAD. FILE CLOSED. And under that, in another hand: NOT BELIEVED. — A.C.",
        responses: [
          {
            text: "[Take the poster.]",
            action: () => {
              if (!L.has("ms_note_wanted_1968"))
                L.give("ms_note_wanted_1968", 1);
              M.token("poster");
              L.xp(15, "The Match Woman");
            },
          },
          { text: "[Leave it.]" },
        ],
      },
    });
    M.spot({
      id: "ms_spot_casemate",
      label: "Casemate cell door",
      verb: "Open",
      when: () => Q.isStarted("mq26") && !L.flag("ms_casemate_open"),
      at: SPOTS.casemate,
      use() {
        const open = () => {
          L.setFlag("ms_casemate_open");
          L.sfx("door_open");
          L.notify(
            "The cell door grinds open on a stone room, a cot, a bucket, and a grey-haired woman in a director's suit sitting very straight on the cot as if she were in a meeting.",
            { duration: 7 },
          );
          if (L.flag("ms_rose_detained") && !L.flag("ms_rose_freed")) {
            L.setFlag("ms_rose_freed");
            M.rose.place("follow");
            L.later(2, () =>
              M.rose.say(
                "Took you long enough. [Rose was in the next cell. She rubs her wrist.] He didn't get the cuff off. Nobody gets the cuff off.",
              ),
            );
          }
          placeCalloway();
        };
        if (G.locks && G.locks.open && !G.isStub("locks")) {
          try {
            G.locks.open(Object.assign({}, LOCKS.casemate), open);
          } catch (e) {
            open();
          }
        } else if (L.has("ms_casemate_key")) open();
        else
          L.notify(
            "Locked. A heavy old lock; the key must be somewhere on the island.",
          );
      },
    });
    // Lys and Corbeau, held since they were reported (bs_expose)
    M.actor({
      id: "ms_lys_cell",
      when: () =>
        L.flag("ms_bureau") === "expose" &&
        Q.isStarted("mq26") &&
        !L.flag("ms_sept_freed"),
      def: () => ({
        type: "human",
        name: "Mademoiselle Lys",
        gender: "f",
        outfit: "merchant",
        faction: SH.sleeperFaction,
        hostile: false,
        essential: true,
        ai: "static",
        dialogue: "dlg_ms_sept_cell",
        at: statueSpot(["cell2", "casemate_cell", "spawn_in3"], 1.35, 30),
      }),
    });
    M.dlg("dlg_ms_sept_cell", "hi").add({
      hi: {
        speaker: "Mademoiselle Lys",
        text: "[Lys sits on a cot with her coat folded beside her; Corbeau lies on the other with his hat over his face.] Monsieur. You reported us, and here you are anyway. The Continuity put Corbeau's codebook in the same locker as their precious key. Let us out, and take the book. I would rather you had it than the sun people.",
        responses: [
          {
            text: "[Unlock the cell.] Go. Both of you.",
            action: () => {
              L.setFlag("ms_sept_freed");
              L.xp(40, "Freed Lys and Corbeau");
              L.notify(
                "Lys and Corbeau slip out through the casemates toward the water. Corbeau tips his hat without a word.",
              );
            },
          },
          { text: "Not yet." },
        ],
      },
    });
  });

  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "lib_crane") {
      L.setFlag("crane_dead");
      L.setFlag("ms_crane", "dead");
      if (Q.isActive("mq06")) Q.complete("mq06");
      if (at("mq25", "confront")) Q.complete("mq25");
      L.news(
        "Reports from the harbour: gunfire on Liberty Island, and then quiet. The Continuity's Colonel Crane is dead. Never met the man. I'm told he signed everything twice.",
      );
    }
  });
  // Completability net: any hit on Crane before he is resolved opens the fight path.
  G.events.on("actorDamaged", (a, dmg, info) => {
    if (
      !a ||
      a.id !== "lib_crane" ||
      a.dead ||
      L.flag("crane_fight") ||
      L.flag("crane_surrendered") ||
      L.flag("crane_ally")
    )
      return;
    if (!Q.isActive("mq06") && !Q.isActive("mq25")) return;
    const src = info && info.source;
    if (
      src === "player" ||
      (src && src.faction === SH.covFaction) ||
      (a.hostile && a.hostile())
    )
      craneFight();
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "ms_note_crane_duty" &&
      G.locks &&
      G.locks.learn &&
      !G.isStub("locks")
    ) {
      try {
        G.locks.learn(
          [LOCKS.evidence.id, LOCKS.safe.id],
          "Colonel Crane's duty log",
        );
      } catch (e) {
        /* */
      }
    }
    if (id === "ms_key_b") {
      L.setFlag("ms_evidence_emptied");
      if (at("mq26", "locker")) Q.setStage("mq26", "keyb");
    }
    if (id === "ms_sirocco_codebook") {
      L.setFlag("ms_codebook_taken");
      L.setFlag("ms_sun_word_denied");
      L.xp(40, "The SIROCCO codebook");
    }
    if (id === "ms_note_file_670305") {
      L.setFlag("ms_safe_emptied");
      if (at("mq27", "safe")) Q.setStage("mq27", "read");
    }
  });
  G.events.on("noteRead", (id) => {
    if (id === "ms_note_file_670305") fileRead();
  });

  // ------------------------------------------------------------------
  // Crane resolution
  // ------------------------------------------------------------------
  function craneFight() {
    L.setFlag("crane_fight");
    const c = L.npc("lib_crane");
    if (c) c.essential = false;
    L.hostile("lib_crane", true);
    L.hostile("lib_rourke", true);
    L.hostile("lib_dunn", true);
    const turncoat = faction() === "continuity" && !L.flag("con_hostile");
    L.setFlag("con_hostile");
    if (turncoat) L.factionTruce(SH.conFaction, undefined, undefined, 0, true);
    else L.factionTruce(SH.conFaction, LIB().x, LIB().z, 200, true);
    if (Q.isActive("mq06")) Q.complete("mq06");
    if (Q.isActive("mq25")) L.refresh("mq25");
  }
  function craneSurrender() {
    L.setFlag("crane_surrendered");
    L.setFlag("ms_crane", "surrendered");
    L.factionTruce(SH.conFaction, LIB().x, LIB().z, 220, false, {
      id: "liberty_surrender",
    });
    L.xp(150, "Colonel Crane stood down");
    if (!L.has("ms_crane_key")) L.give("ms_crane_key", 1);
    if (Q.isActive("mq06")) Q.complete("mq06");
    if (at("mq25", "confront")) Q.complete("mq25");
  }
  function craneAlly() {
    L.setFlag("crane_ally");
    L.setFlag("ms_crane", "ally");
    if (!L.has("ms_crane_key")) L.give("ms_crane_key", 1);
    const M = ms();
    if (M) {
      M.addTrust(-2, "You stood with Crane");
      if (roseHere()) {
        M.rose.say(
          "[Rose looks at you as if she has never seen you before.] He's got my name on his list. And you shook his hand. [She walks out of the command post. Later you see a small boat pulling hard for the Battery.]",
          8,
        );
        L.setFlag("ms_rose_left_liberty");
        L.later(4, () => M.rose.place("home"));
      }
    }
    if (Q.isActive("mq06")) Q.complete("mq06");
    if (at("mq25", "confront")) Q.complete("mq25");
  }
  L.lib_finale = { craneFight, craneSurrender, craneAlly };

  // A Crane resolved before mq25 even started (killed early, an older save): close it as soon as it opens.
  L.hook("update", function () {
    if (
      at("mq25", "confront") &&
      (L.flag("crane_dead") ||
        L.flag("crane_surrendered") ||
        L.flag("crane_ally"))
    ) {
      if (!L.flag("ms_crane"))
        L.setFlag(
          "ms_crane",
          L.flag("crane_dead")
            ? "dead"
            : L.flag("crane_ally")
              ? "ally"
              : "surrendered",
        );
      Q.complete("mq25");
    }
  });

  // ------------------------------------------------------------------
  // mq26: Zeke, Calloway, Key B
  // ------------------------------------------------------------------
  function keyB(choice) {
    if (L.flag("ms_keyB")) return;
    const M = ms();
    if (choice === "destroyed") {
      L.setFlag("ms_keyB", "destroyed");
      L.take("ms_key_b", 1);
      if (roseHere()) {
        M.addTrust(2, "You let her destroy Key B");
        L.notify(
          "Rose lays Key B on the stone floor, puts the muzzle of her rifle to the bow of it and fires. The key jumps, bent double, the stamped letters torn through. She drops it through a gun slit into the harbour, and her hands are shaking.",
          { duration: 9 },
        );
      } else {
        M.addTrust(1, "You destroyed Key B");
        L.notify(
          "You wedge Key B in the hinge of the locker door and lean on it until the shaft bends double. Then you drop it through a gun slit into the harbour.",
          { duration: 7 },
        );
      }
      if (L.flag("ms_dawn_pact") === "agree") L.setFlag("ms_dawn_pact_broken");
    } else {
      L.setFlag("ms_keyB", "kept");
      if (roseHere()) {
        M.addTrust(-1, "You kept Key B");
        M.rose.say(
          "[She drops her hand.] You're going to take it to them. [She doesn't wait for an answer.]",
          6,
        );
      }
    }
    if (at("mq26", "keyb")) Q.complete("mq26");
  }
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.dlg("dlg_ms_keyb", "k").add({
      k: {
        speaker: "",
        text: () =>
          (roseHere()
            ? '[Rose has her hand out. "Give it to me." The other hand is on her rifle, and she doesn\'t seem to know it.] '
            : "") +
          "Key B lies in your palm: a heavy steel arming key, CLÉ B — NAVIGATEUR — SIROCCO 2. Somewhere under Grand Central there is a lock it fits.",
        responses: [
          {
            text: () =>
              roseHere() ? "[Give it to Rose.] Do it." : "[Destroy it.]",
            action: () => keyB("destroyed"),
          },
          { text: "[Keep it.]", action: () => keyB("kept") },
        ],
      },
    });
    M.dlg("dlg_ms_calloway", "idle")
      .when(() =>
        at("mq26", "calloway") && L.flag("ms_casemate_open") ? "freed" : null,
      )
      .add({
        idle: {
          speaker: "Dr. Ruth Calloway",
          text: () =>
            L.flag("ms_calloway_free")
              ? [
                  "Pod seven. Every February. I never opened the door. I will be sorry about that for the rest of my life, which is a shorter sentence than it used to be.",
                  "Is there coffee? No. Of course not.",
                ][Math.floor(Math.random() * 2)]
              : "This cell is locked, and I am in it. Both facts are being logged.",
          responses: [{ text: "Take care, Doctor." }],
        },
        freed: {
          speaker: "Dr. Ruth Calloway",
          text: () =>
            "[She stands, smooths her jacket, and looks at your cryo suit with the expression of a woman checking a delivery against an invoice.] Pod seven. " +
            hero() +
            ". You opened on your own schedule. CUSTODIAN always said you would. I'm sorry about the coffee. I am sorry about a great many things.",
          onEnter() {
            if (!L.flag("ms_calloway_free")) {
              L.setFlag("ms_calloway_free");
              L.xp(80, "Freed Dr. Calloway");
            }
          },
          responses: [
            {
              text: "Doctor — did anyone ever come to the cryo unit? After the Bombing?",
              next: "knock",
            },
          ],
        },
        knock: {
          text:
            "Yes. [She does not hesitate; she has been waiting to say it.] Every twentieth of February since 1968, at about three in the morning, someone knocked on the service door. Three knocks. A woman's voice. She asked for pod seven. Every year. Protocol forbade me to open the door, and I followed protocol, and I am not proud of it. " +
            "She left a candle each time. The first year she had a baby with her; I heard it cry. The last time was this February. The twentieth. The night before I came up after Zeke. Her voice was older. She still asked for pod seven.",
          responses: [{ text: "This February. She's alive.", next: "alive" }],
        },
        alive: {
          text: () =>
            "Someone who knew which pod you were in, and the date you went under, has been knocking on your door for twenty-one years. I would call that alive, Mr. " +
            lastName() +
            ". I would call that very alive.",
          onEnter() {
            L.setFlag("ms_nicole_alive_known");
            stoneScene();
            if (at("mq26", "calloway")) Q.setStage("mq26", "locker");
          },
          responses: [{ text: "...Thank you, Doctor." }],
        },
      });
  });
  function stoneScene() {
    if (L.flag("ms_stone_scene")) return;
    L.setFlag("ms_stone_scene");
    const M = ms();
    if (!M) return;
    const lines = [
      [
        "Zeke Marlow",
        "I saw her stone, " +
          first() +
          ". In the cathedral garden, before they grabbed me. NICOLE MEAD, KINDLED. I didn't put it on the reel. I didn't know how. ...The dirt was never turned. Nobody's under there.",
        7.5,
      ],
    ];
    if (roseHere() && !L.flag("ms_rose_detained"))
      lines.push([
        roseName(),
        "[Everyone is looking at her. Rose looks at the floor, then at the gun slit, then at you.] I'll explain. Not here.",
        6,
      ]);
    else if (L.flag("ms_rose_revealed"))
      lines.push([
        "",
        'Rose told you her mother was dead. Rose stood at that stone and said "That\'s her."',
        6,
      ]);
    M.scene(lines);
    L.setFlag("ms_rose_lie1_exposed");
  }

  // ------------------------------------------------------------------
  // mq27: the file
  // ------------------------------------------------------------------
  function fileRead() {
    if (!L.flag("ms_attribution_read")) {
      L.setFlag("ms_attribution_read");
      L.xp(80, "FILE 67-03-05");
    }
    if (roseHere() && !L.flag("ms_rose_sirocco_line")) {
      L.setFlag("ms_rose_sirocco_line");
      L.later(1, () =>
        ms().rose.say(
          "[Rose reads the Sirocco Two page over your shoulder and goes white.] That's ours. That's the Sun.",
          6,
        ),
      );
    }
    if (at("mq27", "read") || at("mq27", "safe")) Q.setStage("mq27", "decide");
    L.later(roseHere() ? 7 : 1.5, () => {
      if (at("mq27", "decide") && ms())
        ms().talk("dlg_ms_file", "FILE 67-03-05");
    });
  }
  function fileDecide(choice) {
    if (choice === "broadcast") {
      L.setFlag("ms_attribution_broadcast");
      L.setFlag("hale_defects");
      L.setFlag("ms_hale_defects");
      L.news(
        "This is Rocky Delgado, and I'm reading you something that came over the Liberty relay an hour ago, and I'm going to read it slow. Brussels gave the order. Paris said no and got outvoted. And our own Office of Civil Defense read that order twenty-six hours before the bombers came, and moved the list to Liberty Island, and told nobody. Nobody. ...I need a minute, folks.",
      );
      L.notify(
        "You feed FILE 67-03-05 into the torch relay. Across the harbour, every receiver in the city starts printing.",
        { duration: 6 },
      );
    } else if (choice === "sept") {
      L.setFlag("ms_attribution_to_sept");
      L.notify(
        "You fold FILE 67-03-05 into your suit. Corbeau has waited twenty-two years for it; he can wait a few days more.",
        { duration: 5 },
      );
    } else L.setFlag("ms_attribution_kept");
    if (at("mq27", "decide")) Q.complete("mq27");
  }
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.dlg("dlg_ms_file", "f").add({
      f: {
        speaker: "",
        text: "FILE 67-03-05. Brussels gave the order. Paris was outvoted. The OCD read it twenty-six hours early and moved the rolls instead of warning anyone. And SIROCCO TWO's weapon was never recovered. What do you do with it?",
        responses: [
          {
            text: "[Broadcast it over the torch relay.]",
            action: () => fileDecide("broadcast"),
          },
          {
            text: "[Keep it for Lys and Corbeau.]",
            action: () => fileDecide("sept"),
          },
          { text: "[Keep it.]", action: () => fileDecide("keep") },
        ],
      },
    });
    // The decision can be revisited from the goggles: re-reading the file re-opens the choice while mq27 waits.
    M.spot({
      id: "ms_spot_file_decide",
      label: "FILE 67-03-05",
      verb: "Decide",
      when: () => at("mq27", "decide"),
      at: SPOTS.command,
      use() {
        M.talk("dlg_ms_file", "FILE 67-03-05");
      },
    });
  });

  // ------------------------------------------------------------------
  // mq28: the torch
  // ------------------------------------------------------------------
  const hasKey = () => L.has("q_liberty_key");
  const hasCore = () => L.has("q_knickerbocker_core");
  const craneResolved = () =>
    L.flag("crane_dead") || L.flag("crane_surrendered") || L.flag("crane_ally");
  const microfilmHere = () =>
    L.flag("ms_microfilm") === "continuity" ||
    L.flag("li_un_tapes_to") === "continuity";
  const canChoose = () =>
    hasKey() &&
    hasCore() &&
    craneResolved() &&
    !L.flag("ms_torch") &&
    (at("mq28", "choose") || at("mq28", "climb"));
  function readyTorch() {
    if (!hasCore()) {
      L.give("q_knickerbocker_core", 1);
      L.notify(
        faction() === "covenant"
          ? 'Lancer Castillo presses the Knickerbocker core into your hands. "The Commander says you\'d better be the one to plug it in."'
          : faction() === "continuity"
            ? "A Continuity quartermaster signs the Knickerbocker core back out to you, in triplicate."
            : "You unpack the Knickerbocker core. It hums like it knows where it is.",
        { duration: 6 },
      );
    }
    if (!hasKey()) L.give("q_liberty_key", 1, true);
  }
  L.trigger({
    id: "ms_torch_climb",
    once: false,
    cooldown: 1.5,
    pos: () => L.termPos("liberty_torch"),
    r: 7,
    cond: () => at("mq28", "climb"),
    fire() {
      readyTorch();
      L.say(
        "lib_zeke",
        "Six days on the tide, " +
          first() +
          ". Whatever you load, she fires at noon on Sunday. Noon, Sunday. Choose like somebody's going to wake up after you.",
      );
      Q.setStage("mq28", "choose");
    },
  });
  G.events.on("terminalOpened", (id) => {
    if (
      (id === "liberty_torch" || id === "liberty_command") &&
      at("mq28", "climb")
    ) {
      readyTorch();
      Q.setStage("mq28", "choose");
    }
  });
  function choose(choice) {
    if (L.flag("ms_torch")) return;
    const M = ms();
    const t =
      {
        purify: "reclamation",
        selective: "selective",
        covenant: "charter",
        destroy: "destroyed",
      }[choice] || choice;
    L.setFlag("ms_torch", t);
    L.take("q_knickerbocker_core", 1);
    if (G.terminals && typeof G.terminals.close === "function") {
      try {
        G.terminals.close();
      } catch (e) {
        /* */
      }
    }
    if (G.state === "terminal" || G.state === "play") G.setState("cutscene");
    L.later(0.3, () => torchCinematic(t));
    if (t === "selective") {
      L.standing(-1000, "Loaded Directive 7-A");
      if (M) {
        M.setTrust(0);
        L.later(5, () => M.say(M.roseName(), "You just signed my name.", 6));
        L.setFlag("ms_rose_left_liberty");
        L.later(9, () => M.rose.place("home"));
      }
      L.setFlag("ms_zeke_wont_muster");
    } else if (t === "reclamation")
      L.standing(150, "Programmed the torch for everyone");
    else if (t === "charter") {
      L.standing(25, "Handed the Array to the Iron Covenant");
      L.setFlag("con_hostile");
    }
    if (L.flag("crane_ally") && t !== "selective" && L.alive("lib_crane"))
      L.setFlag("crane_betrayed");
  }
  L.finale = { choose };
  function torchCinematic(t) {
    const P = G.player,
      c = LIB();
    const torch = L.V3(c.x - 2, 88, c.z);
    const y0 = P.yaw,
      p0 = P.pitch,
      y1 = Math.atan2(-(c.x - P.pos.x), -(c.z - P.pos.z));
    L.cinematic(
      6.5,
      (e, k) => {
        const q = Math.min(1, k * 2.5),
          qe = q * q * (3 - 2 * q);
        P.yaw = y0 + G.util.wrapAngle(y1 - y0) * qe;
        P.pitch = p0 + (0.75 - p0) * qe;
      },
      () => {
        if (G.state === "cutscene") G.setState("play");
        const lines = {
          reclamation:
            "The Array accepts RECLAMATION. A dial on the teletype starts to turn: TIDAL CHARGE 2%. Six days of tide, and at noon on Sunday the sky gets scrubbed for everyone.",
          selective:
            "The Array accepts DIRECTIVE 7-A. The teletype prints the schedule in a neat column of names, and keeps printing. At noon on Sunday it will do what it was told.",
          charter:
            "The Array accepts the CHARTER OVERRIDE. The torch locks. At noon on Sunday, by design, nothing will happen at all.",
          destroyed:
            "The core screams. The torch above you comes apart in a ball of white fire, and brass and glass rain into the harbour for a full minute.",
        };
        L.notify(lines[t], { duration: 8 });
        L.later(2.5, () => {
          if (at("mq28", "choose") || at("mq28", "climb")) Q.complete("mq28");
        });
      },
    );
    L.sfx("hum_electric", { volume: 1 });
    if (t === "destroyed") {
      L.later(2.6, () => {
        if (!G.isStub("fx")) {
          try {
            G.fx.explosion(torch, 14, "normal");
          } catch (e) {
            /* */
          }
        }
        L.sfx("explosion_nuke");
        if (P.shake) P.shake(1, 2.5);
        L.overlay("#ffb050", 1.2, 0.6, 1.4, 0.9);
        try {
          G.player.damage(15, { type: "explosive" });
        } catch (e) {
          /* */
        }
        L.setFlag("ms_array_fired", "destroyed");
        L.news(
          "Did you see it? Did you HEAR it? Lady Liberty's torch went up like the Fourth of July we never got in '67. Whatever was up there is at the bottom of the harbour now. Nobody gets it. Maybe that's the only fair decision there is.",
        );
      });
    }
    // Crossing the Colonel at the last second: a line, and a one-way Rotorcraft ride.
    if (L.flag("crane_ally") && t !== "selective" && L.alive("lib_crane")) {
      L.later(3.4, () =>
        L.say(
          "lib_crane",
          "You — you absolute — I vouched for you. I put it in WRITING!",
        ),
      );
      L.later(5.2, () =>
        L.say("lib_rourke", "Colonel, the Rotorcraft. Now, sir."),
      );
      L.later(8, () => {
        L.setFlag("crane_gone");
        for (const id of ["lib_crane", "lib_rourke", "lib_dunn"])
          L.removeNPC(id);
      });
    }
  }

  // ------------------------------------------------------------------
  // "Noon, Sunday": the Array fires (after the finale). Lasting world consequences.
  // ------------------------------------------------------------------
  const SKY_POOLS = {
    purify: { clear: 0.62, overcast: 0.2, rain: 0.12, fog: 0.06 },
    selective: { thunderstorm: 0.4, dust: 0.25, overcast: 0.25, fog: 0.1 },
  };
  function skyMode() {
    return L.flag("sky_clean")
      ? "purify"
      : L.flag("the_cleaning")
        ? "selective"
        : null;
  }
  let wxT = 0;
  function applySky(opts) {
    const mode = skyMode();
    if (!mode || G.isStub("atmos") || !G.atmos.setWeather) return;
    opts = opts || {};
    const pool = SKY_POOLS[mode];
    let names = Object.keys(pool);
    try {
      const have = G.atmos.weatherNames ? G.atmos.weatherNames() : null;
      if (have && have.length)
        names = names.filter((n) => have.indexOf(n) >= 0);
    } catch (e) {
      /* */
    }
    if (!names.length) return;
    let name = opts.name;
    if (!name) {
      let tot = 0;
      for (const n of names) tot += pool[n];
      let r = Math.random() * tot;
      name = names[names.length - 1];
      for (const n of names) {
        r -= pool[n];
        if (r <= 0) {
          name = n;
          break;
        }
      }
    }
    try {
      G.atmos.setWeather(name, {
        auto: false,
        hold: 1e9,
        duration: opts.duration || 30,
        instant: !!opts.instant,
        silent: !!opts.silent,
      });
    } catch (e) {
      /* */
    }
    wxT = 240 + Math.random() * 300;
  }
  L.hook("update", function (dt) {
    if (!(dt > 0) || !skyMode()) return;
    wxT -= dt;
    let cur = null;
    try {
      cur = G.atmos.getWeather ? G.atmos.getWeather() : null;
    } catch (e) {
      cur = null;
    }
    const pool = SKY_POOLS[skyMode()];
    if (wxT <= 0 || (cur && pool[cur] === undefined)) applySky({});
  });
  L.hook("loaded", function () {
    if (skyMode())
      applySky({
        name: skyMode() === "purify" ? "clear" : "thunderstorm",
        instant: true,
        silent: true,
      });
  });

  /**
   * The Array fires at noon on Sunday (the finale's day). Idempotent. Called when mq36 completes, or by the
   * finale module (G.quests.lib.ms.fireArray()) when its epilogue reaches noon.
   */
  function fireArray() {
    const t = L.flag("ms_torch");
    if (!t || L.flag("consequences_applied")) return;
    L.setFlag("consequences_applied");
    L.setFlag("ms_array_fired", t);
    L.setFlag(
      "ending_choice",
      {
        reclamation: "purify",
        selective: "selective",
        charter: "covenant",
        destroyed: "destroy",
      }[t],
    );
    if (t === "reclamation") {
      L.setFlag("sky_clean");
      applySky({ name: "clear", duration: 6 });
    } else if (t === "selective") {
      L.setFlag("the_cleaning");
      applySky({ name: "thunderstorm", duration: 8 });
      if (!G.isStub("actors") && G.actors.list) {
        for (const a of G.actors.list().slice()) {
          if (a.dead || !isDoomed(a)) continue;
          if (a.essential) a.essential = false;
          try {
            a.kill();
          } catch (e) {
            /* */
          }
        }
      }
    }
    const n = {
      reclamation:
        "Folks... go outside. Put down whatever you're doing and go outside and look up. That's blue. That's BLUE. I was nineteen the last time I saw it. Somebody programmed the torch on Lady Liberty and at noon the sky came back. This one's for everybody.",
      selective:
        "This is Rocky Delgado. I... the Neon is dark. Times Square is quiet. Marigold used to call in every Thursday to request the slow one. She didn't call today. I'm going to play it anyway. I'm going to play it all night.",
      charter:
        "Noon on Sunday, folks, and the torch on Liberty sat there like a lamp with no bulb. The Covenant says that's the point. Sky's the same colour as yesterday. Safer, they tell me.",
    }[t];
    if (n) L.news(n);
  }
  G.events.on("questCompleted", (v) => {
    if (v && v.id === "mq36") L.later(2, fireArray);
  });

  // ------------------------------------------------------------------
  // The world slides for the finale's epilogue (the old torch slides, re-dated to spring 1989).
  // ms.worldSlides() → [{title, text, art}] — the finale module decides where they go.
  // ------------------------------------------------------------------
  function worldSlides() {
    const t = L.flag("ms_torch") || "charter";
    const choice = {
      reclamation: "purify",
      selective: "selective",
      charter: "covenant",
      destroyed: "destroy",
    }[t];
    const f = (k) => L.flag(k);
    const g = (k) => L.flag("glow_" + k);
    const N = hero();
    const S = [];
    const push = (title, text, art) =>
      S.push({ title, text, art: art || null });
    // Cryo Unit C-9
    if (choice === "purify")
      push(
        "CRYO UNIT C-9",
        'Under the Municipal Building, CUSTODIAN logged the new sky as "ATMOSPHERIC CONDITION: NOMINAL (FIRST OCCURRENCE)" and printed the line eleven hundred times before its last ribbon ran dry. Zeke had the printout framed. It hangs crooked over the Oyster Bar, and Moe refuses to straighten it.',
        "cryo",
      );
    else if (choice === "selective")
      push(
        "CRYO UNIT C-9",
        "Cryo Unit C-9 was resealed by order of the Continuity, and CUSTODIAN was reassigned to keep the new census. It printed the names of the enrolled for a year. After that, it printed no new names at all.",
        "cryo",
      );
    else
      push(
        "CRYO UNIT C-9",
        "Cryo Unit C-9 stayed where it was: thirty-eight failed pods and two empty ones under the Municipal Building. CUSTODIAN typed out a full report on the spring of 1989, addressed it to the Office of Civil Defense, and waited for a reply. It is very good at waiting.",
        "cryo",
      );
    // The Neon
    if (choice === "selective")
      push(
        "THE NEON",
        "Times Square went dark and stayed dark. Mayor Crowe, Big Sal, Marigold and every unenrolled soul in the Neon were the first to fall to the census. The signs still hang there — FIZZO COLA, PRAIRIE ROOT BEER, HI-OCTANE HARRY'S — advertising to no one.",
        "neon_dark",
      );
    else if (
      f("ms_sun_battery") === "neon" ||
      f("neon_outcome") === "crowe" ||
      f("neon_outcome") === "repair"
    )
      push(
        "THE NEON",
        "Thanks to a rig battery and a stubborn sleeper, the lights of the Neon never went out. Mayor Crowe declared " +
          N +
          " an Honorary Citizen in perpetuity, and every year on the anniversary the people of Times Square switch every sign on at once, just to hear the newcomers gasp.",
        "neon",
      );
    else
      push(
        "THE NEON",
        "The Big Buzz sputtered on for another year before the folks of the Neon pooled their scrip and bought a new battery off a Brooklyn convoy. Mayor Crowe gave a four-hour speech about it. Nobody stayed for the end.",
        "neon",
      );
    // Wendell & Marjorie
    if (f("wendell_wed") && choice !== "selective")
      push(
        "WENDELL & MARJORIE",
        'Wendell Pruitt and Marjorie "Marigold" Dunn were married in Housewares on the third floor of Sterling\'s — cleared of Maniacs for the occasion by a very reluctant Covenant patrol. It was, by general agreement, the longest engagement in the history of New York.',
        "wedding",
      );
    // Grand Central
    let gc = g("isotope_planted")
      ? "Grand Central Market never fully recovered from the poisoning of its water tower. Doc Hollis worked himself half to death that spring."
      : "Grand Central Market grew into the beating heart of Manhattan. Stationmaster Okafor ran it for thirty more years and never once fixed the clock.";
    if (!g("isotope_planted")) {
      if (f("pete_rescued"))
        gc +=
          " Pete Ruiz drove the Broadway run until he was eighty, and never again ate anything he could not identify.";
      if (f("dolores_recruited"))
        gc +=
          " Deadeye Dolores watched over its convoys from a window on 42nd Street for the rest of her life.";
      if (f("bridge_legit"))
        gc +=
          " The Brooklyn Bridge Toll Authority — under Commissioner Tony — became the most reliable institution in the five boroughs, issuing over a million receipts.";
      else if (f("bridge_resolved"))
        gc +=
          " With the Brooklyn Bridge open again, Brooklyn's traders poured across the river.";
      if (f("wagon_honest"))
        gc +=
          " Caldwell & Daughter grew into the largest convoy company on the Eastern Seaboard.";
    }
    push("GRAND CENTRAL MARKET", gc, "market");
    // KONG
    if (f("kong_friend") && choice !== "selective")
      push(
        "KONG",
        "Kong, King of the Empire, and Fay, his silent queen, reigned over the Empire State Building for decades. Sightseers — yes, sightseers — came to see the couple on the observation deck. Nobody screamed. Kong was very happy.",
        "kong",
      );
    else if (f("kong_dead"))
      push(
        "KONG",
        "Kong, King of the Empire, died as he had lived: enormous, confused and very loud. Within a year the tower belonged to the pigeons.",
        "kong",
      );
    // The Covenant / the Continuity
    if (
      choice === "covenant" ||
      (faction() === "covenant" && choice !== "selective" && !f("stroud_dead"))
    )
      push(
        "THE IRON COVENANT",
        "Rockefeller Hold kept Manhattan for a generation. Lancer-Commander Stroud ruled with an iron hand and a closed fist; the city was safer, and quieter, and not entirely free.",
        "covenant",
      );
    if (f("crane_betrayed") && !f("crane_dead"))
      push(
        "COLONEL CRANE",
        "Colonel Augustus Crane was last seen climbing into a Rotorcraft on Liberty Island, still shouting. Continuity Radio spent a year calling " +
          N +
          " a traitor to the Republic, in triplicate.",
        "crane",
      );
    if (choice === "selective")
      push(
        "THE CONTINUITY",
        'With the census "restored," the Continuity declared Manhattan the provisional capital and the year, officially, 1967.' +
          (f("crane_dead") ? "" : " Colonel Crane was promoted.") +
          " Within a generation there was nobody young enough left to salute anybody.",
        "continuity",
      );
    else if ((f("hale_defects") || f("hale_knows")) && !f("hale_dead"))
      push(
        "LIEUTENANT HALE",
        "Vesper Hale never went back to the Continuity. She settled in Grand Central, where she taught the market's children to read — starting with the fine print.",
        "hale",
      );
    else
      push(
        "THE CONTINUITY",
        "The Continuity's eastern command never recovered from the loss of Liberty Island. Their Sky-Eye drones still drift over the Ruins at night, playing the anthem to a country that stopped listening a long time ago.",
        "continuity",
      );
    // Biscuit
    if (f("biscuit_dead"))
      push(
        "BISCUIT",
        "Biscuit, the dog from Bethesda Terrace, fell defending the one he'd chosen. Somebody keeps a bowl of water by his cairn. Somebody keeps it clean.",
        "dog",
      );
    else if (f("biscuit_recruited"))
      push(
        "BISCUIT",
        "Biscuit never left " +
          N +
          '\'s side. He never learned "heel," either. He grew grey around the muzzle and lazy in the sun, and every burrow rat in Central Park lived in terror of him.',
        "dog",
      );
    // Companions (36_companions.js)
    if (typeof L.companionSlides === "function") {
      let cs = [];
      try {
        cs = L.companionSlides(choice, N) || [];
      } catch (e) {
        G.reportError("quests:companionSlides", e);
      }
      for (const c of cs) push(c.title, c.text, c.art || null);
    }
    return S;
  }
  // No 'main' ending any more (the finale owns endings); keep a harmless default.
  L.ending("default", function () {
    return [
      {
        title: G.GAME_NAME || "NEW RAD CITY",
        text: "The sirens stopped in 1967. The city never did.",
        art: "city",
      },
    ];
  });

  // ------------------------------------------------------------------
  // Terminal: TORCH CONTROL
  // ------------------------------------------------------------------
  const TORCH_TERMINAL = {
    title: "KNICKERBOCKER ATMOSPHERIC RECLAMATION ARRAY",
    header:
      'OFFICE OF CIVIL DEFENSE / ATLAS POWER & LIGHT — "THE TORCH"\nCIVILIAN AUTHORIZATION: CARTRIDGE C9-A REQUIRED\nTIDAL CHARGE: 6 DAYS. SCHEDULED FIRING: SUNDAY 12:00',
    entries: [
      {
        title: "System Status",
        text: () =>
          "CARTRIDGE C9-A ........... " +
          (hasKey()
            ? "PRESENT (Long Winter volunteer verified)"
            : "NOT PRESENT") +
          "\nIGNITION CORE ........... " +
          (hasCore()
            ? "PRESENT (charge 98%)"
            : L.flag("ms_torch")
              ? "LOADED"
              : "NOT PRESENT") +
          "\nPROGRAM .................. " +
          (L.flag("ms_torch")
            ? String(L.flag("ms_torch")).toUpperCase() +
              (L.flag("ms_torch") === "destroyed"
                ? ""
                : " — FIRES SUNDAY 12:00")
            : "NONE") +
          (craneResolved()
            ? ""
            : "\n\n>> MILITARY LOCKOUT ACTIVE (Col. A. Crane). Resolve command authority to proceed."),
      },
      {
        title: "Operating Modes",
        text: "RECLAMATION: scrubs airborne radioactive ash from a 40 km radius. Permanent. Indiscriminate. Beneficiaries: all living things.\n\nSELECTIVE: reclamation field keyed to the 1967 enrolment rolls (requires the executive payload, Directive 7-A, AND the enrolment microfilm). Unenrolled persons receive a sterilising dose. Recorded census refusers receive a lethal one, as do persons carrying a heavy radiation burden.\n\nOVERRIDE: transfer the Array to a recognised armed authority (requires a charter reel).\n\nOVERLOAD: emergency core purge. Destroys the Array immediately.\n\nAll programs except OVERLOAD fire on the tidal schedule: SUNDAY, 12:00.",
      },
      {
        title: "Dedication Plaque (1967)",
        text: 'THE KNICKERBOCKER ARRAY\nDedicated by the Office of Civil Defense and Atlas Power & Light, February 1967, "so that whatever comes, New York shall always breathe free."\n\n[Scratched beneath, much later: "we built it for everybody — Z."]',
      },
      {
        title: ">> LOAD RECLAMATION (FIRES SUNDAY NOON)",
        cond: () => canChoose(),
        action: () => choose("purify"),
      },
      {
        title: ">> LOAD DIRECTIVE 7-A: SELECTIVE (FIRES SUNDAY NOON)",
        cond: () =>
          canChoose() && L.has("q_reel_directive_7a") && microfilmHere(),
        action: () => choose("selective"),
      },
      {
        title: ">> APPLY CHARTER OVERRIDE: THE IRON COVENANT",
        cond: () => canChoose() && L.has("q_reel_codex_override"),
        action: () => choose("covenant"),
      },
      {
        title: ">> INITIATE CORE OVERLOAD (DESTROY ARRAY NOW)",
        cond: () => canChoose(),
        action: () => choose("destroy"),
      },
      {
        title: "Liberty Station — Command Log",
        text: 'LIBERTY STATION (CONTINUITY OF GOVERNMENT) — COL. A. CRANE COMMANDING\n\nDay 2: Asset MARLOW (Long Winter, C-9) continues to refuse. Asset MARLOW has repaired the station\'s water heater "out of spite."\nDay 6: Acting President Marsh confirms Directive 7-A by radio. Countersigned. Countersigned. Countersigned.\nDay 8: The second sleeper has left C-9. They always come to us.',
      },
    ],
  };
  L.hook("register", function () {
    L.terminal("liberty_torch", TORCH_TERMINAL);
    L.terminal("liberty_command", TORCH_TERMINAL);
  });

  // ------------------------------------------------------------------
  // Dialogue: Colonel Crane, Zeke
  // ------------------------------------------------------------------
  L.hook("register", function () {
    const censusCheck = { attr: "wits", value: 8 };
    const censusLine =
      "Your soldiers were born after 1967, Colonel. Not one of them is on the rolls. Neither is Hale.";
    const crRose = () =>
      roseHere() &&
      !L.flag("ms_rose_hidden") &&
      !L.flag("ms_rose_detained") &&
      !L.flag("ms_rose_shield_tried");
    const confronting = () => Q.isActive("mq25") || Q.isActive("mq06");
    const burned = () =>
      L.flag("ms_microfilm") === "burned" ||
      L.flag("li_un_tapes_to") === "burned";
    const mainResponses = () => [
      {
        text: "[Presence 6] Eyes on me, Colonel. She's my guide. She was born in Hoboken and she's never been near your father's station.",
        cond: () => crRose(),
        check: { attr: "presence", value: 6 },
        next: "shield_ok",
        failNext: "shield_fail",
      },
      { text: '"Unlisted." You mean people.', next: "people" },
      {
        text: "There are no rolls any more, Colonel. The microfilm is gone. I burned it.",
        cond: burned,
        next: "rolls_burned",
      },
      {
        text: censusLine,
        check: censusCheck,
        next: "genome",
        failNext: "genome_fail",
        cond: () => !burned(),
      },
      {
        text: "[Persuasion 75] Stand down, Colonel. Nobody else has to die today.",
        check: { skill: "persuasion", value: 75 },
        next: "surrender",
        failNext: "nosurrender",
      },
      {
        text: "You're right. Let's light the torch together.",
        next: "ally_offer",
      },
      { text: "Enough talk.", next: "fight" },
    ];
    L.dialogue("dlg_lib_crane", {
      start: () => {
        if (L.flag("crane_surrendered")) return "surrendered";
        if (L.flag("crane_ally")) return "ally";
        if (L.flag("crane_fight")) return "fighting";
        if (!confronting()) return "early";
        if (Q.isActive("mq06")) Q.complete("mq06");
        return faction() === "continuity" && !L.flag("con_hostile")
          ? "con"
          : "hello";
      },
      nodes: {
        early: {
          speaker: "Colonel Crane",
          text: "You are on federal property without an appointment, and I am in no mood to make one. Go back to the city, sleeper. You will come back properly. They always do.",
          responses: [{ text: "[Leave.]" }],
        },
        hello: {
          speaker: "Colonel Crane",
          text: () =>
            "That's far enough. [The black helmet tilts, lamps glowing.] Colonel Augustus Crane, United States Government, commanding Liberty Station. And you are the second sleeper, with the key, and — yes, I can hear it humming — the core as well." +
            (faction() === "covenant"
              ? " I see you've also brought the boilers from Rockefeller. Less thoughtful."
              : ""),
          responses: [
            { text: "Where are Zeke and Dr. Calloway?", next: "zeke" },
            { text: "What do you want, Colonel?", next: "want" },
            { text: "Enough talk.", next: "fight" },
          ],
        },
        zeke: {
          text: "Marlow is in what the Park Service once called a gift shop. Unharmed. He has spent weeks lecturing my men on water pressure; three of them have requested transfers, on the correct form. Your Dr. Calloway is in a cell in the old fort. She rowed out here to ask me what I thought I was doing. I told her.",
          responses: [{ text: "What do you want, Colonel?", next: "want" }],
        },
        want: {
          text: () =>
            "The same thing you want, I suspect: a clean sky. The difference between us is that I have read the fine print. Directive 7-A is surgery. Everyone counted in 1967 breathes clean air. Everyone else simply... stops. No more unlisted children. One generation, and the country is the country again. " +
            "[He takes his helmet off. A tired, lined, grey face.] I was eleven when the bombers came, and twelve when a woman with a box of matches burned my father's station with him inside. Grand Central, the Relief Station, the fifth of March, 1968. They wrote her up as dead. I have never believed it. Nor that the baby she did it for died." +
            (roseHere() && !L.flag("ms_rose_detained")
              ? " [His eyes go to the leather cuff on Rose's wrist, and stay there.]"
              : ""),
          responses: mainResponses(),
        },
        shield_ok: {
          text: "[A long look. Then he puts the helmet back on.] Hoboken. Of course. Forgive me, miss. An old man sees his father's murderer in every shadow with a wrist. [He turns back to you.] Where were we.",
          onEnter() {
            L.setFlag("ms_rose_hidden");
            L.setFlag("ms_rose_shield_tried");
            L.xp(40, "Presence: Hoboken");
          },
          responses: mainResponses(),
        },
        shield_fail: {
          text: "[He doesn't look away from the cuff.] Hoboken. [Quietly, to the sergeant.] Rourke. Detain the young lady. Gently. I want to see that wrist in good light.",
          onEnter() {
            L.setFlag("ms_rose_detained");
            L.setFlag("ms_rose_shield_tried");
            const M = ms();
            if (M) {
              M.rose.say("Don't, Dad. Don't. Let them. I'll be fine.", 5);
              M.rose.place("at", SPOTS.casemate());
            }
          },
          responses: mainResponses(),
        },
        people: {
          text: () =>
            "I mean the future, " +
            volunteer() +
            ". Someone has to decide what it looks like. It might as well be someone with a plan, a uniform and the correct forms.",
          responses: [
            {
              text: "[Persuasion 75] Stand down, Colonel.",
              check: { skill: "persuasion", value: 75 },
              next: "surrender",
              failNext: "nosurrender",
            },
            {
              text: "There are no rolls any more, Colonel. I burned the microfilm.",
              cond: burned,
              next: "rolls_burned",
            },
            {
              text: censusLine,
              check: censusCheck,
              next: "genome",
              failNext: "genome_fail",
              cond: () => !burned(),
            },
            { text: "Enough talk.", next: "fight" },
          ],
        },
        rolls_burned: {
          text: "[He stares at you.] The microfilm. From the UN strongroom. [His hand finds the edge of the map table.] Then Seven-A runs on nothing. A sieve with no holes. ...Twenty-two years. [He sits down, which you suspect he has not done in front of his men in a decade.] Sergeant. Stand the men down. There is nothing left to guard.",
          onEnter() {
            L.setFlag("crane_genome");
            L.xp(120, "The rolls are gone");
          },
          responses: [
            { text: "It's over, Colonel.", action: () => craneSurrender() },
          ],
        },
        genome: {
          text: "[A long silence. The helmet lamps flicker.] ...Rourke was born in '70. Dunn in '72, in the old shelter under Fourteenth Street. Hale... [Another silence.] The rolls closed in March of 1967. Every man on this island who would ever outlive me. We would have counted ourselves out of history. ...Sergeant. Stand the men down.",
          onEnter() {
            L.xp(100, "Wits: Not on the rolls");
            L.setFlag("crane_genome");
          },
          responses: [
            { text: "It's over, Colonel.", action: () => craneSurrender() },
          ],
        },
        genome_fail: {
          text: "Clever. Wrong, but clever. Enlisted personnel are enrolled by Supplementary Schedule C. I signed it myself. I always sign it myself.",
          responses: [
            {
              text: "[Persuasion 75] Stand down, Colonel.",
              check: { skill: "persuasion", value: 75 },
              next: "surrender",
              failNext: "nosurrender",
            },
            { text: "Enough talk.", next: "fight" },
            { text: "Then let's do it your way.", next: "ally_offer" },
          ],
        },
        surrender: {
          text: "[He is quiet for a long time.] You sound like him. Marlow. \"Nobody else has to die.\" [He lowers his rifle.] They told me men like my father would fix it. Perhaps we're not the men for it. ...All units, stand down. That is an order. Log it. [He holds out a ring of keys.] The locker and the safe. You'll want what's in them. I never did.",
          onEnter() {
            L.xp(100, "Persuasion: Stand down");
          },
          responses: [
            { text: "Thank you, Colonel.", action: () => craneSurrender() },
          ],
        },
        nosurrender: {
          text: () =>
            "Nobody else? " +
            volunteer() +
            ", EVERYONE else has been dying since 1967. I am the only one here with a plan to make it stop.",
          responses: [
            { text: "Then I'll stop you.", next: "fight" },
            { text: "Then let's do it your way.", next: "ally_offer" },
          ],
        },
        ally_offer: {
          text: "[For the first time, he smiles.] Good. Good man. The torch, then, with the Directive. I'll be right beside you. And my keys — take them; you'll want Marlow loose for the wiring. He built it, after all.",
          responses: [
            {
              text: "Yes, Colonel.",
              standing: -100,
              action: () => craneAlly(),
            },
            { text: "On second thought — no.", next: "fight" },
          ],
        },
        fight: {
          text: "Pity. Sergeant — the volunteer is to be taken alive. Everyone else is expendable. We'll do the paperwork afterwards.",
          onEnter() {
            craneFight();
          },
          responses: [{ text: "[Fight!]" }],
        },
        con: {
          speaker: "Colonel Crane",
          text: "The second sleeper, at last. Lieutenant Hale speaks highly of you, and she speaks highly of almost no one. You have the key, the core and the Directive. Walk with me to the torch. Load Directive 7-A, and history will write your name beside mine. In ink.",
          responses: [
            {
              text: "Yes, Colonel.",
              standing: -100,
              action: () => craneAlly(),
            },
            { text: "Tell me about your father first.", next: "want" },
            { text: "I'll program it — for everyone.", next: "betray" },
          ],
        },
        betray: {
          text: "[The helmet lamps narrow.] I was warned you might say that. Hale, of all people, warned me. ...Soldiers.",
          onEnter() {
            craneFight();
          },
          responses: [{ text: "[Fight!]" }],
        },
        surrendered: {
          text: () =>
            "I've given my men leave to go home. Wherever that is. [He looks up at the torch.] Do the right thing, " +
            volunteer() +
            ". I clearly wasn't going to.",
          responses: [{ text: "[Leave.]" }],
        },
        ally: {
          text: "The torch awaits. History awaits. I await, which I am not good at.",
          responses: [{ text: "[Leave.]" }],
        },
        fighting: {
          text: "[Crane is in no mood to talk.]",
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    L.dialogue("dlg_lib_zeke", {
      start: () => {
        if (L.flag("ms_torch") && Q.isComplete("mq28")) return "after";
        if (L.flag("ms_zeke_free") || L.flag("zeke_freed")) return "again";
        return Q.isActive("mq26") ? "free" : "notyet";
      },
      nodes: {
        notyet: {
          speaker: "Zeke Marlow",
          text: () =>
            first() +
            "? " +
            first().toUpperCase() +
            "! [An older man in a patched cryo suit, zip-tied to a display rack of souvenir torches.] Not yet, kid — not like this. Crane's men would shoot us both before the pier. Come back when the Colonel's dealt with.",
          responses: [{ text: "Hang on, Zeke." }],
        },
        free: {
          speaker: "Zeke Marlow",
          text: () =>
            first() +
            "? " +
            first().toUpperCase() +
            ". [He struggles up off a crate, zip-tied at the wrists.] Look at you. Thawed and walking. You came. You absolute knucklehead, you came." +
            (L.flag("crane_ally")
              ? " ...With HIM. Tell me you're not with him."
              : ""),
          responses: [
            {
              text: "[Cut the ties.] Happy to see you too, Zeke.",
              next: "freed",
            },
            {
              text: "We had a deal. Whoever wakes up first waits for the other one.",
              next: "freed",
            },
          ],
        },
        freed: {
          text: "Twenty-two years on ice, and I wake up to find they never switched it on. MY Array. I wired half of that thing in '66. A lung for the whole city. [He rubs his wrists.] And the Director — Calloway — they've got her in the old fort, in a casemate. The guard keeps the key on that hook. I've been staring at it for weeks. [He takes it down and presses it into your hand.]",
          onEnter() {
            if (!L.flag("ms_zeke_free")) {
              L.setFlag("ms_zeke_free");
              L.setFlag("zeke_freed");
              L.xp(100, "Found Zeke");
              L.standing(50, "Freed Zeke");
            }
            if (!L.has("ms_casemate_key")) L.give("ms_casemate_key", 1);
            if (at("mq26", "zeke")) Q.setStage("mq26", "calloway");
          },
          responses: [{ text: "Let's get her out." }],
        },
        again: {
          text: () =>
            Q.isActive("mq28")
              ? "Torch teletype. Six days on the tide, noon on Sunday. Whatever you choose — I'm proud of you. Even if you choose wrong. ESPECIALLY if you choose wrong; that's how I know you chose."
              : Q.isActive("mq26")
                ? "Calloway first. Then the locker. Then we talk about my Array."
                : "You know where to find me. The stool with my name scratched in it.",
          responses: [{ text: "Thanks, Zeke." }],
        },
        after: {
          text: () =>
            L.flag("ms_torch") === "selective"
              ? "[Zeke will not look at you. He is staring at the floor.]"
              : L.flag("ms_array_fired") === "reclamation"
                ? "Blue. It's BLUE. [He is crying and not hiding it.] I'm going to look at that sky until they throw me out."
                : "Noon on Sunday. Whatever happens, we're both still breathing, and that's more than most stories get. Come find me at the Oyster Bar. I'll buy. With your scrip, probably.",
          responses: [{ text: "See you at the Oyster Bar, Zeke." }],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // Test solvers (forced stage walk) + debug
  // ------------------------------------------------------------------
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.solver("mq06", {
      land() {
        landed();
        if (at("mq06", "land")) Q.setStage("mq06", "pedestal");
      },
      pedestal() {
        Q.setStage("mq06", "command");
      },
      command() {
        Q.complete("mq06");
      },
    });
    M.solver("mq25", {
      confront() {
        craneSurrender();
      },
    });
    M.solver("mq26", {
      zeke() {
        L.setFlag("ms_zeke_free");
        L.setFlag("zeke_freed");
        L.give("ms_casemate_key", 1);
        Q.setStage("mq26", "calloway");
      },
      calloway() {
        L.setFlag("ms_casemate_open");
        L.setFlag("ms_calloway_free");
        L.setFlag("ms_nicole_alive_known");
        Q.setStage("mq26", "locker");
      },
      locker() {
        L.give("ms_key_b", 1);
        if (at("mq26", "locker")) Q.setStage("mq26", "keyb");
      },
      keyb() {
        keyB("destroyed");
      },
    });
    M.solver("mq27", {
      safe() {
        L.give("ms_note_file_670305", 1);
        if (at("mq27", "safe")) Q.setStage("mq27", "read");
      },
      read() {
        fileRead();
      },
      decide() {
        fileDecide("keep");
      },
    });
    M.solver("mq28", {
      climb() {
        readyTorch();
        Q.setStage("mq28", "choose");
      },
      choose() {
        L.setFlag("ms_torch", "reclamation");
        L.take("q_knickerbocker_core", 1);
        Q.complete("mq28");
      },
    });
  });
  G.quests.debug.finale = (choice) => {
    if (G.quests.debug.ms) G.quests.debug.ms.skipTo("mq28");
    L.give("q_liberty_key", 1, true);
    L.give("q_knickerbocker_core", 1, true);
    L.setFlag("crane_surrendered");
    if (Q.isActive("mq28")) Q.setStage("mq28", "choose");
    if (choice) choose(choice);
    return Q.stage("mq28");
  };
})();
