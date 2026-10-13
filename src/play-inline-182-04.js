// play-inline-182 04 — yaw
// Lines 655-866 of readable/play-inline-182.pretty.js (statement-aligned).
  K.terminalDef("pmid_bv_lab", {
    title: "KESSLER-HAAS — RESILIENCE STUDY",
    header: "CONTRACT CD-BLV-7 · OFFICE OF CIVIL DEFENSE · CLASSIFIED",
    lock: K.LOCKS.bv_lab,
    entries: [
      {
        title: "Contract Summary",
        text: 'Civil Defense requires a "pre-hardened" civilian cohort for long-term shelter viability. Kessler-Haas will supply the K-agent, strain BLV-7, administered via routine vaccination. Subjects sourced from Bellevue psychiatric intake (no next of kin).\nCompensation: $14,000,000 + naming rights.',
      },
      {
        title: "Subject Log: T. Grogan",
        text: 'Day 3: height +4 cm. Day 9: height +31 cm. Day 12: subject restrained after "diagnosing" a nurse with a fractured spine (subject caused the fracture). Day 14: subject has memorised the Merck Manual. Day 15: subject asks to be called "Doctor". Day 16: we are calling him Doctor.',
      },
      {
        title: "Tank Status",
        text: () =>
          K.q.flag("pmid_kagent_purged")
            ? "TANKS 1-7: PURGED. CONTENTS NEUTRALISED."
            : 'TANKS 1, 5: RUPTURED.\nTANKS 2, 3, 4, 6: VIABLE — K-agent BLV-7, 400 L each.\nTANK 7: "Occupied".',
      },
      {
        title: "Emergency Purge (all tanks)",
        cond: () => !K.q.flag("pmid_kagent_purged"),
        action: () => {
          K.q.setFlag("pmid_kagent_purged", true);
          K.xp(150, "Purged the K-agent tanks");
          K.standing(100, "Destroyed the Bellevue K-agent stock");
          K.news(
            "A little bird tells me the lights went out for good under Bellevue Hospital tonight. Whatever was brewing down there, it isn't anymore. Good work, whoever you are. Wash your hands.",
          );
          try {
            G.sfx.play("alarm");
          } catch (e) {
            /* */
          }
          return "PURGE SEQUENCE INITIATED. Caustic flush... thermal sterilisation... TANKS NEUTRALISED.\nThe Continuity will not be getting its samples.";
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Bosses (named, stable ids — combat restores dead/alive state on load)
  // ------------------------------------------------------------------
  const typeOk = (t) => {
    try {
      return (
        !G.isStub("chars") && G.chars.types && G.chars.types().indexOf(t) >= 0
      );
    } catch (e) {
      return false;
    }
  };
  const at = (poi, n, dy) => {
    const v = K.anchor(poi, n);
    return v ? { x: v.x, y: v.y + (dy || 0), z: v.z, yaw: v.yaw || 0 } : null;
  };
  K.npc(() => {
    const p = at("waldorf", "boss");
    if (!p) return null;
    return {
      id: "pmid_wa_vale",
      type: typeOk("continuity_soldier") ? "continuity_soldier" : "human",
      outfit: "continuity_exo_rig",
      gender: "f",
      name: "Major Constance Vale",
      faction: "continuity",
      level: 15,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 7 },
      weapon: "gyrojet_carbine",
      voice: "continuity",
      noRespawn: true,
      inventory: [
        ["gyrojet_carbine", 1],
        ["ammo_gyrojet", 20],
        ["rally_tonic", 2],
        ["q_pmid_wa_codes", 1],
      ],
      barks: {
        combat: [
          "You are trespassing on federal property!",
          "For the Continuity!",
          "I have waited twenty-two years for a target like you.",
        ],
        idle: ["Signals, report.", "Where is my Bellevue team?"],
      },
      onDeath: () => {
        K.q.setFlag("pmid_vale_dead", true);
        K.news(
          "Reports from Park Avenue: the Continuity officer holed up in the Waldorf-Astoria has checked out. Permanently.",
        );
      },
    };
  });
  K.npc(() => {
    const p = at("metlife_tower", "boss");
    if (!p) return null;
    return {
      id: "pmid_ml_adjuster",
      type: typeOk("bulwark") ? "bulwark" : "patrolman",
      name: "Claims Adjuster Mk. IV",
      faction: "robots",
      level: 11,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 9 },
      voice: "patrolman",
      noRespawn: true,
      inventory: [
        ["pmid_fine_print", 1],
        ["pmid_ml_prudence_card", 1],
        ["dry_cell", 2],
        ["ammo_gyrojet", 12],
      ],
      barks: {
        combat: [
          "YOUR CLAIM HAS BEEN DENIED.",
          "PRE-EXISTING CONDITION DETECTED: MORTALITY.",
          "THIS ENCOUNTER IS NOT A COVERED EVENT.",
          "ADJUSTING... ADJUSTING...",
        ],
        idle: [
          "Reviewing claims. All claims denied.",
          "The light that never fails. The claim that never pays.",
        ],
      },
      onDeath: () => {
        K.q.setFlag("pmid_adjuster_dead", true);
      },
    };
  });
  K.npc(() => {
    const p = at("penn_station", "boss");
    if (!p) return null;
    return {
      id: "pmid_penn_conductor",
      type: typeOk("maniac_bruiser") ? "maniac_bruiser" : "maniac",
      name: "The Conductor",
      faction: "maniacs",
      level: 9,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 12 },
      noRespawn: true,
      inventory: [
        ["q_pmid_penn_key", 1],
        ["pmid_pocket_watch", 1],
        ["prussian_blue", 1],
      ],
      barks: {
        combat: [
          "[a long howl, like a train whistle]",
          "Aaaaa-BOOOOOO...",
          "[gibbering, punching an invisible ticket]",
        ],
      },
    };
  });
  K.npc(() => {
    const p = at("bellevue", "boss");
    if (!p) return null;
    return {
      id: "pmid_bv_chief",
      type: typeOk("brute") ? "brute" : "human",
      name: "Chief Resident Grogan",
      faction: "brutes",
      level: 12,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 10 },
      weapon: "fire_axe",
      voice: "brute",
      noRespawn: true,
      hp: 520,
      inventory: [
        ["fire_axe", 1],
        ["rally_tonic", 2],
        ["focus_pills", 1],
        ["scrip", 85],
      ],
      barks: {
        combat: [
          "Time for your CHECK-UP, humie!",
          "Doctor says: HOLD STILL!",
          "This will only hurt A LOT.",
          "Nurse! NURSE! ...Nurse is dead. Doctor does it himself.",
        ],
        idle: ["Hmm. Chart says patient is... tasty.", "Next!"],
      },
      onDeath: () => {
        K.q.setFlag("pmid_chief_dead", true);
      },
    };
  });

  // Picking up the Conductor's watch key unlocks the payroll box.
  G.events.on("itemAdded", (id) => {
    if (id === "q_pmid_penn_key") {
      if (K.unlockContainer("penn_station", "Broadway Limited Payroll Box"))
        K.say("The watch key fits the Broadway Limited payroll box.");
    }
  });
