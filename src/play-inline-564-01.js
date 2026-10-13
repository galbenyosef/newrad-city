// play-inline-564 01 — locks
// Lines 24-300 of readable/play-inline-564.pretty.js (statement-aligned).
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
