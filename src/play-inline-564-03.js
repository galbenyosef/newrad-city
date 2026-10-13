// play-inline-564 03 — flag
// Lines 640-977 of readable/play-inline-564.pretty.js (statement-aligned).
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
